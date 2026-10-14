import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const severities = ['info', 'low', 'moderate', 'high', 'critical']
const blocking = new Set(['high', 'critical'])
const advisoryPattern =
  /^https:\/\/github\.com\/advisories\/(GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})$/
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

function requireValid(condition, message) {
  if (!condition) throw new Error(message)
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function validateExceptions(policy, now = Date.now()) {
  requireValid(isObject(policy), 'Missing exception policy')
  requireValid(
    Object.keys(policy).sort().join(',') === 'exceptions,version',
    'Malformed exception policy fields',
  )
  requireValid(
    policy.version === 1 && Array.isArray(policy.exceptions),
    'Unsupported exception policy',
  )
  const keys = new Set()
  for (const exception of policy.exceptions) {
    requireValid(isObject(exception), 'Malformed exception')
    requireValid(
      Object.keys(exception).sort().join(',') ===
        'advisory,expires,justification,owner,package,versions',
      'Malformed exception fields',
    )
    requireValid(
      typeof exception.advisory === 'string' &&
        /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(exception.advisory),
      'Invalid exception advisory',
    )
    for (const field of ['package', 'owner', 'justification']) {
      requireValid(
        typeof exception[field] === 'string' && exception[field].trim().length > 0,
        `Missing exception ${field}`,
      )
    }
    requireValid(!/[\s*]/.test(exception.package), 'Invalid exception package')
    requireValid(
      Array.isArray(exception.versions) &&
        exception.versions.length > 0 &&
        exception.versions.every(
          (version) => typeof version === 'string' && versionPattern.test(version),
        ),
      'Exception requires exact versions',
    )
    requireValid(
      new Set(exception.versions).size === exception.versions.length,
      'Duplicate exception versions',
    )
    const expiry = Date.parse(exception.expires)
    requireValid(
      typeof exception.expires === 'string' &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(exception.expires) &&
        Number.isFinite(expiry) &&
        new Date(expiry).toISOString() === exception.expires.replace('Z', '.000Z'),
      'Invalid exception expiry',
    )
    requireValid(expiry > now, 'Expired exception')
    requireValid(expiry <= now + 30 * 24 * 60 * 60 * 1000, 'Exception expiry exceeds 30 days')
    for (const version of exception.versions) {
      const key = `${exception.advisory}:${exception.package}:${version}`
      requireValid(!keys.has(key), 'Duplicate exception scope')
      keys.add(key)
    }
  }
  return policy.exceptions
}

export function evaluateAudit(report, policy, lockfile, now = Date.now()) {
  const exceptions = validateExceptions(policy, now)
  requireValid(
    isObject(report) && report.auditReportVersion === 2 && !report.error,
    'Missing or unsupported audit evidence',
  )
  requireValid(
    isObject(report.vulnerabilities) && isObject(report.metadata?.vulnerabilities),
    'Malformed audit evidence',
  )
  requireValid(
    isObject(report.metadata.dependencies) &&
      ['prod', 'dev', 'optional', 'peer', 'peerOptional', 'total'].every(
        (key) =>
          Number.isInteger(report.metadata.dependencies[key]) &&
          report.metadata.dependencies[key] >= 0,
      ) &&
      report.metadata.dependencies.total > 0,
    'Missing dependency audit counts',
  )
  requireValid(
    lockfile?.lockfileVersion === 3 && isObject(lockfile.packages),
    'Missing lockfile evidence',
  )
  const counts = Object.fromEntries(severities.map((severity) => [severity, 0]))
  const findings = new Map()
  for (const [name, entry] of Object.entries(report.vulnerabilities)) {
    requireValid(
      isObject(entry) && entry.name === name && severities.includes(entry.severity),
      `Malformed vulnerability: ${name}`,
    )
    requireValid(
      Array.isArray(entry.via) &&
        entry.via.length > 0 &&
        Array.isArray(entry.nodes) &&
        entry.nodes.length > 0,
      `Incomplete vulnerability: ${name}`,
    )
    counts[entry.severity]++
    for (const node of entry.nodes) {
      requireValid(
        typeof node === 'string' &&
          node
            .split('/node_modules/')
            .at(-1)
            .replace(/^node_modules\//, '') === name &&
          typeof lockfile.packages[node]?.version === 'string',
        `Missing locked version: ${name}`,
      )
    }
    for (const via of entry.via) {
      if (typeof via === 'string') {
        requireValid(isObject(report.vulnerabilities[via]), `Missing transitive evidence: ${via}`)
        continue
      }
      requireValid(
        isObject(via) &&
          via.name === name &&
          severities.includes(via.severity) &&
          typeof via.url === 'string',
        `Malformed advisory: ${name}`,
      )
      if (!blocking.has(via.severity)) continue
      const advisory = via.url.match(advisoryPattern)?.[1]
      requireValid(advisory, `Unsupported blocking advisory identifier: ${name}`)
      for (const node of entry.nodes) {
        const version = lockfile.packages[node].version
        const key = `${advisory}:${name}:${version}`
        findings.set(key, { advisory, package: name, version, severity: via.severity })
      }
    }
  }
  const metadata = report.metadata.vulnerabilities
  for (const severity of severities) {
    requireValid(
      Number.isInteger(metadata[severity]) && metadata[severity] === counts[severity],
      `Inconsistent audit counts: ${severity}`,
    )
  }
  requireValid(
    metadata.total === Object.keys(report.vulnerabilities).length,
    'Inconsistent total audit count',
  )

  // Every blocking dependency chain must lead to an actual blocking advisory.
  function hasBlockingAdvisory(name, visited = new Set()) {
    if (visited.has(name)) return false
    visited.add(name)
    return report.vulnerabilities[name].via.some((via) =>
      typeof via === 'string'
        ? hasBlockingAdvisory(via, new Set(visited))
        : blocking.has(via.severity),
    )
  }
  for (const [name, entry] of Object.entries(report.vulnerabilities)) {
    requireValid(
      !blocking.has(entry.severity) || hasBlockingAdvisory(name),
      `Unresolved blocking evidence: ${name}`,
    )
  }
  const used = new Set()
  const rows = [...findings.values()].map((finding) => {
    const index = exceptions.findIndex(
      (exception) =>
        exception.advisory === finding.advisory &&
        exception.package === finding.package &&
        exception.versions.includes(finding.version),
    )
    if (index >= 0) used.add(index)
    return { ...finding, exception: index >= 0 ? exceptions[index] : null }
  })
  requireValid(
    used.size === exceptions.length,
    'Unused exception: remove stale or mismatched scopes',
  )
  return { passed: rows.every((row) => row.exception !== null), counts, findings: rows }
}

export function readAuditResult(result) {
  requireValid(
    !result.error && !result.signal && [0, 1].includes(result.status),
    'Audit command failed or unavailable',
  )
  requireValid(
    typeof result.stdout === 'string' && result.stdout.trim().length > 0,
    'Missing audit output',
  )
  const report = JSON.parse(result.stdout)
  requireValid(!report.error, 'Audit registry returned an error')
  requireValid(
    Number.isInteger(report.metadata?.vulnerabilities?.total) &&
      result.status === (report.metadata.vulnerabilities.total > 0 ? 1 : 0),
    'Audit exit status contradicts report',
  )
  return report
}

function main() {
  const reportPath = resolve('reports/production-audit.json')
  const resultPath = resolve('reports/production-audit-result.json')
  mkdirSync(dirname(reportPath), { recursive: true })
  try {
    requireValid(process.env.npm_execpath, 'Run this gate using npm run security:audit')
    const result = spawnSync(
      process.execPath,
      [process.env.npm_execpath, 'audit', '--omit=dev', '--json', '--audit-level=info'],
      { encoding: 'utf8', timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
    )
    writeFileSync(
      reportPath,
      result.stdout || JSON.stringify({ error: 'Audit output unavailable' }),
    )
    const report = readAuditResult(result)
    const policy = JSON.parse(readFileSync('security/audit-exceptions.json', 'utf8'))
    const lockfile = JSON.parse(readFileSync('package-lock.json', 'utf8'))
    const evaluation = evaluateAudit(report, policy, lockfile)
    writeFileSync(resultPath, JSON.stringify(evaluation, null, 2) + '\n')
    console.log(
      `Production audit: ${evaluation.counts.high} high, ${evaluation.counts.critical} critical; ${evaluation.findings.filter((row) => row.exception).length} excepted advisories.`,
    )
    for (const row of evaluation.findings)
      console.log(
        `${row.exception ? 'EXCEPTED' : 'BLOCKED'} ${row.advisory} ${row.package}@${row.version}`,
      )
    if (process.env.GITHUB_STEP_SUMMARY)
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `\n## Production security audit\n\n${evaluation.passed ? 'Passed' : 'Blocked'}: ${evaluation.counts.high} high, ${evaluation.counts.critical} critical package findings. See audit artifacts for advisory and exception details.\n`,
      )
    if (!evaluation.passed) process.exitCode = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    writeFileSync(resultPath, JSON.stringify({ passed: false, error: message }, null, 2) + '\n')
    console.error(`Production audit blocked: ${message}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
