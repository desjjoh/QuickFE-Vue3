import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { evaluateAudit, readAuditResult, validateExceptions } from './security-audit.mjs'

const now = Date.parse('2026-10-13T12:00:00Z')
const advisory = 'GHSA-abcd-efgh-2345'
const policy = () => ({ version: 1, exceptions: [] })
const lock = () => ({
  lockfileVersion: 3,
  packages: {
    '': { name: 'test' },
    'node_modules/example': { version: '1.2.3' },
    'node_modules/parent': { version: '2.0.0' },
  },
})
const exception = () => ({
  advisory,
  package: 'example',
  versions: ['1.2.3'],
  owner: 'security-owner',
  justification: 'Reviewed exposure and temporary mitigation; tracked for replacement.',
  expires: '2026-10-20T12:00:00Z',
})
function report(severity) {
  const counts = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 }
  const vulnerabilities = {}
  if (severity) {
    counts[severity] = counts.total = 1
    vulnerabilities.example = {
      name: 'example',
      severity,
      nodes: ['node_modules/example'],
      via: [{ name: 'example', severity, url: `https://github.com/advisories/${advisory}` }],
    }
  }
  return {
    auditReportVersion: 2,
    vulnerabilities,
    metadata: {
      vulnerabilities: counts,
      dependencies: { prod: 2, dev: 0, optional: 0, peer: 0, peerOptional: 0, total: 2 },
    },
  }
}

test('passes valid clean evidence and reports lower severity findings without blocking', () => {
  for (const severity of [undefined, 'info', 'low', 'moderate'])
    assert.equal(evaluateAudit(report(severity), policy(), lock(), now).passed, true)
})
for (const severity of ['high', 'critical']) {
  test(`blocks unreviewed ${severity} findings`, () =>
    assert.equal(evaluateAudit(report(severity), policy(), lock(), now).passed, false))
  test(`permits only an exact active exception for ${severity}`, () => {
    const result = evaluateAudit(
      report(severity),
      { version: 1, exceptions: [exception()] },
      lock(),
      now,
    )
    assert.equal(result.passed, true)
    assert.equal(result.findings[0].exception.owner, 'security-owner')
  })
}
test('resolves transitive cycles to their underlying advisory without requiring blanket parent exceptions', () => {
  const evidence = report('high')
  evidence.vulnerabilities.example.via.push('parent')
  evidence.vulnerabilities.parent = {
    name: 'parent',
    severity: 'high',
    nodes: ['node_modules/parent'],
    via: ['example'],
  }
  evidence.metadata.vulnerabilities.high = evidence.metadata.vulnerabilities.total = 2
  const result = evaluateAudit(evidence, { version: 1, exceptions: [exception()] }, lock(), now)
  assert.equal(result.passed, true)
  assert.equal(result.findings.length, 1)
})
test('blocks an additional advisory or installed version outside an exception', () => {
  const evidence = report('high')
  evidence.vulnerabilities.example.via.push({
    name: 'example',
    severity: 'critical',
    url: 'https://github.com/advisories/GHSA-abcd-efgh-6789',
  })
  assert.equal(
    evaluateAudit(evidence, { version: 1, exceptions: [exception()] }, lock(), now).passed,
    false,
  )
  const versions = lock()
  versions.packages['node_modules/parent/node_modules/example'] = { version: '1.2.4' }
  const multi = report('high')
  multi.vulnerabilities.example.nodes.push('node_modules/parent/node_modules/example')
  assert.equal(
    evaluateAudit(multi, { version: 1, exceptions: [exception()] }, versions, now).passed,
    false,
  )
})

const malformedReports = {
  missing: () => null,
  registryError: (value) => ({ ...value, error: { code: 'EAUDIT' } }),
  oldSchema: (value) => ({ ...value, auditReportVersion: 1 }),
  missingVulnerabilities: (value) => ({ ...value, vulnerabilities: null }),
  missingMetadata: (value) => ({ ...value, metadata: {} }),
  missingDependencies: (value) => {
    delete value.metadata.dependencies
    return value
  },
  inconsistentCounts: (value) => {
    value.metadata.vulnerabilities.high = 0
    return value
  },
  inconsistentTotal: (value) => {
    value.metadata.vulnerabilities.total = 0
    return value
  },
  missingNodes: (value) => {
    value.vulnerabilities.example.nodes = []
    return value
  },
  unknownNode: (value) => {
    value.vulnerabilities.example.nodes = ['node_modules/missing']
    return value
  },
  missingVia: (value) => {
    value.vulnerabilities.example.via = []
    return value
  },
  missingTransitive: (value) => {
    value.vulnerabilities.example.via = ['missing']
    return value
  },
  unresolvedCycle: (value) => {
    value.vulnerabilities.example.via = ['example']
    return value
  },
  unsupportedSeverity: (value) => {
    value.vulnerabilities.example.severity = 'unknown'
    return value
  },
  unknownAdvisory: (value) => {
    value.vulnerabilities.example.via[0].url = 'https://example.com/unknown'
    return value
  },
}
for (const [name, mutate] of Object.entries(malformedReports))
  test(`rejects audit evidence: ${name}`, () =>
    assert.throws(() => evaluateAudit(mutate(report('high')), policy(), lock(), now)))

const malformedExceptions = {
  missingOwner: (value) => {
    delete value.owner
    return value
  },
  emptyJustification: (value) => ({ ...value, justification: ' ' }),
  wildcardPackage: (value) => ({ ...value, package: '*' }),
  wildcardAdvisory: (value) => ({ ...value, advisory: '*' }),
  versionRange: (value) => ({ ...value, versions: ['^1.2.3'] }),
  emptyVersions: (value) => ({ ...value, versions: [] }),
  duplicateVersions: (value) => ({ ...value, versions: ['1.2.3', '1.2.3'] }),
  unknownField: (value) => ({ ...value, disableAudit: true }),
  missingExpiry: (value) => {
    delete value.expires
    return value
  },
  invalidDate: (value) => ({ ...value, expires: '2026-02-30T12:00:00Z' }),
  expired: (value) => ({ ...value, expires: '2026-10-12T12:00:00Z' }),
  exactExpiryBoundary: (value) => ({ ...value, expires: '2026-10-13T12:00:00Z' }),
  overlyLongExpiry: (value) => ({ ...value, expires: '2027-01-01T12:00:00Z' }),
}
for (const [name, mutate] of Object.entries(malformedExceptions))
  test(`rejects exception: ${name}`, () =>
    assert.throws(() => validateExceptions({ version: 1, exceptions: [mutate(exception())] }, now)))
test('rejects missing policy, unknown schemas, duplicate scopes and stale exceptions', () => {
  for (const value of [
    null,
    [],
    {},
    { version: 2, exceptions: [] },
    { version: 1, exceptions: [], bypass: true },
    { version: 1, exceptions: [exception(), exception()] },
  ])
    assert.throws(() => validateExceptions(value, now))
  assert.throws(
    () => evaluateAudit(report(), { version: 1, exceptions: [exception()] }, lock(), now),
    /Unused exception/,
  )
  for (const change of [
    { package: 'parent' },
    { advisory: 'GHSA-abcd-efgh-6789' },
    { versions: ['1.2.4'] },
  ])
    assert.throws(() =>
      evaluateAudit(
        report('high'),
        { version: 1, exceptions: [{ ...exception(), ...change }] },
        lock(),
        now,
      ),
    )
})
test('accepts an exception expiring at the maximum permitted lifetime', () => {
  const value = exception()
  value.expires = '2026-11-12T12:00:00Z'
  assert.equal(validateExceptions({ version: 1, exceptions: [value] }, now).length, 1)
})
test('rejects missing lockfile and locked versions', () => {
  assert.throws(() => evaluateAudit(report(), policy(), null, now))
  const value = lock()
  delete value.packages['node_modules/example'].version
  assert.throws(() => evaluateAudit(report('high'), policy(), value, now))
})
test('validates npm exit status, failed commands and unavailable or malformed output', () => {
  assert.deepEqual(readAuditResult({ status: 0, stdout: JSON.stringify(report()) }), report())
  assert.deepEqual(
    readAuditResult({ status: 1, stdout: JSON.stringify(report('high')) }),
    report('high'),
  )
  for (const result of [
    { status: 0, stdout: '' },
    { status: 0, stdout: '{invalid' },
    { status: 0, stdout: '{}' },
    { status: 1, stdout: JSON.stringify(report()) },
    { status: 0, stdout: JSON.stringify(report('high')) },
    { status: 2, stdout: JSON.stringify(report()) },
    { status: 0, error: new Error('spawn failed') },
    { status: null, signal: 'SIGTERM' },
    { status: 1, stdout: JSON.stringify({ error: { code: 'EAUDIT' } }) },
  ])
    assert.throws(() => readAuditResult(result))
})
test('CLI fails closed on missing, malformed, expired policies and unavailable audit evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'quickfe-audit-'))
  try {
    mkdirSync(join(directory, 'security'))
    writeFileSync(join(directory, 'package-lock.json'), JSON.stringify(lock()))
    const mockNpm = join(directory, 'npm.cjs')
    writeFileSync(
      mockNpm,
      `require('node:assert/strict').deepEqual(process.argv.slice(2), ['audit', '--omit=dev', '--json', '--audit-level=info']); process.stdout.write(process.env.TEST_AUDIT_OUTPUT || ''); process.exit(Number(process.env.TEST_AUDIT_STATUS || 0))`,
    )
    const run = (output, status = 0) =>
      spawnSync(
        process.execPath,
        [fileURLToPath(new URL('./security-audit.mjs', import.meta.url))],
        {
          cwd: directory,
          env: {
            ...process.env,
            npm_execpath: mockNpm,
            TEST_AUDIT_OUTPUT: output,
            TEST_AUDIT_STATUS: String(status),
            GITHUB_STEP_SUMMARY: '',
          },
          encoding: 'utf8',
        },
      )
    assert.equal(run(JSON.stringify(report())).status, 1)
    for (const value of [
      '{invalid',
      JSON.stringify({
        version: 1,
        exceptions: [{ ...exception(), expires: '2000-01-01T00:00:00Z' }],
      }),
    ]) {
      writeFileSync(join(directory, 'security/audit-exceptions.json'), value)
      assert.equal(run(JSON.stringify(report())).status, 1)
    }
    writeFileSync(join(directory, 'security/audit-exceptions.json'), JSON.stringify(policy()))
    for (const output of ['', '{invalid', JSON.stringify({ error: { code: 'EAUDIT' } })])
      assert.equal(run(output).status, 1)
    assert.equal(run(JSON.stringify(report('high')), 1).status, 1)
    assert.equal(
      JSON.parse(readFileSync(join(directory, 'reports/production-audit-result.json'), 'utf8'))
        .passed,
      false,
    )
    assert.equal(run(JSON.stringify(report())).status, 0)
    assert.equal(
      JSON.parse(readFileSync(join(directory, 'reports/production-audit-result.json'), 'utf8'))
        .passed,
      true,
    )
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
test('CI security job runs the gate and retains evidence on failure', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')
  const job = workflow.slice(
    workflow.indexOf('  security-audit:'),
    workflow.indexOf('  unit-tests:'),
  )
  assert.match(job, /run: npm ci/)
  assert.match(job, /run: npm run security:audit/)
  assert.match(job, /if: always\(\)/)
  assert.match(job, /reports\/production-audit.json/)
  assert.match(job, /reports\/production-audit-result.json/)
  assert.doesNotMatch(job, /continue-on-error/)
})
