import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  eligible,
  globMatches,
  measuredCoverage,
  coverageRegressions,
  validateBaseline,
  moduleName,
  normalizeCoveragePath,
  hasCurrentHumanApproval,
  reviewReduction,
  baselineChanges,
  unrecordedGains,
  criticalCoverage,
  criticalModules,
  criticalThresholds,
} from '../testing/coverage.mjs'

const policy = {
  include: ['src/**/*.ts', 'src/**/*.vue'],
  exclude: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/__tests__/**',
    '**/fixtures/**',
    '**/*.d.ts',
    '**/*.generated.ts',
    '**/*.generated.vue',
  ],
}
const stats = (covered = 8, total = 10) =>
  Object.fromEntries(
    ['statements', 'lines', 'functions', 'branches'].map((metric) => [metric, { covered, total }]),
  )
const path = '/repo/src/shared/helpers/example.ts'
function measured(covered = 8, total = 10) {
  return measuredCoverage(
    { total: stats(covered, total), [path]: stats(covered, total) },
    ['src/shared/helpers/example.ts'],
    '/repo',
  )
}
const baseline = () => ({
  version: 1,
  provider: 'v8',
  reason: 'Initial measured baseline',
  policy,
  ...measured(),
})

test('critical per-file gates block each below-threshold metric independently of repository totals', () => {
  const files = Object.fromEntries(
    Object.values(criticalModules)
      .flat()
      .map((path) => [path, stats(100, 100)]),
  )
  assert.equal(criticalCoverage(files).failures.length, 0)
  for (const metric of Object.keys(criticalThresholds)) {
    const changed = structuredClone(files)
    const path = Object.keys(changed)[0]
    changed[path][metric].covered = criticalThresholds[metric] - 1
    const result = criticalCoverage(changed)
    assert.equal(result.failures.length, 1)
    assert.equal(result.failures[0].file, path)
    assert.equal(result.failures[0].metric, metric)
    changed[path][metric].covered++
    assert.equal(criticalCoverage(changed).failures.length, 0)
  }
})
test('critical gates fail closed on omitted, malformed and empty executable evidence', () => {
  const files = Object.fromEntries(
    Object.values(criticalModules)
      .flat()
      .map((path) => [path, stats(100, 100)]),
  )
  const path = Object.keys(files)[0]
  for (const value of [undefined, null, {}, stats(0, 0), stats(101, 100)]) {
    assert.throws(() => criticalCoverage({ ...files, [path]: value }))
  }
  assert.throws(() => criticalCoverage(null))
  assert.throws(() => criticalCoverage({}))
})

test('includes untested Vue/application files and excludes only declared fixtures, tests, declarations and generated sources', () => {
  for (const file of [
    'src/App.vue',
    'src/main.ts',
    'src/views/template/Home.vue',
    'src/shared/helpers/example.ts',
  ])
    assert.equal(eligible(file, policy), true, file)
  for (const file of [
    'src/a.spec.ts',
    'src/a.test.ts',
    'src/a.d.ts',
    'src/a.generated.ts',
    'src/a.generated.vue',
    'src/shared/api/__tests__/fixtures.ts',
    'src/fixtures/account.ts',
    'test/support/mount.ts',
    'scripts/build/bundle-exposure.ts',
    'src/styles/a.scss',
  ])
    assert.equal(eligible(file, policy), false, file)
  assert.equal(globMatches('src/app.ts', 'src/**/*.ts'), true)
  assert.equal(globMatches('src/a.vue', 'src/**/*.ts'), false)
})
test('normalizes Windows/Linux paths and groups component families and feature stores separately', () => {
  assert.equal(
    normalizeCoveragePath('W:\\repo\\src\\shared\\helpers\\x.ts', 'W:\\repo'),
    'src/shared/helpers/x.ts',
  )
  assert.equal(
    moduleName('src/library/components/table/DataTable.vue'),
    'src/library/components/table',
  )
  assert.equal(moduleName('src/views/profile/stores/profile.ts'), 'src/views/profile/stores')
  assert.equal(moduleName('src/views/profile/ProfileView.vue'), 'src/views/profile')
  assert.throws(() => normalizeCoveragePath('/other/src/a.ts', '/repo'))
  assert.throws(() => normalizeCoveragePath('/repo/src/../a.ts', '/repo'))
})
test('accepts a complete zero-hit report and preserves untested files in the measured denominator', () => {
  const result = measured(0)
  assert.equal(result.global.lines.covered, 0)
  assert.equal(result.global.lines.total, 10)
  assert.equal(Object.keys(result.files).length, 1)
})
test('rejects missing, partial, duplicate, extraneous and malformed coverage evidence', () => {
  for (const summary of [
    null,
    {},
    { total: stats() },
    { total: stats(), [path]: stats(11, 10) },
    { total: stats(), [path]: stats(7) },
    { total: stats(), [path]: stats(), '/repo/src/missing.ts': stats() },
  ])
    assert.throws(() => measuredCoverage(summary, ['src/shared/helpers/example.ts'], '/repo'))
  assert.throws(() => measuredCoverage({ total: stats(), [path]: stats() }, [], '/repo'))
  assert.throws(() =>
    measuredCoverage(
      { total: stats(), [path]: stats() },
      ['src/shared/helpers/example.ts', 'src/shared/helpers/example.ts'],
      '/repo',
    ),
  )
  const invalid = stats()
  invalid.branches.covered = NaN
  assert.throws(() =>
    measuredCoverage(
      { total: stats(), [path]: invalid },
      ['src/shared/helpers/example.ts'],
      '/repo',
    ),
  )
})
test('blocks exact global, module and existing-file decreases without percentage-rounding loopholes', () => {
  assert.equal(coverageRegressions(measured(), baseline()).length, 0)
  assert.equal(coverageRegressions(measured(9), baseline()).length, 0)
  const rows = coverageRegressions(measured(7), baseline())
  assert.equal(rows.length, 12)
  assert.ok(rows.some((row) => row.scope === 'global'))
  assert.ok(rows.some((row) => row.scope.startsWith('module:')))
  assert.ok(rows.some((row) => row.scope.startsWith('file:')))
  assert.ok(
    coverageRegressions(measured(79999, 100000), { ...baseline(), ...measured(80000, 100000) })
      .length > 0,
  )
})
test('extra uncovered code lowers the ratio even when covered counters are unchanged', () => {
  assert.ok(coverageRegressions(measured(8, 11), baseline()).length > 0)
})
test('coverage gains must be recorded so later drops cannot pass an obsolete lower floor', () => {
  assert.equal(unrecordedGains(measured(), baseline()).improvements.length, 0)
  assert.equal(unrecordedGains(measured(9), baseline()).improvements.length, 12)
  assert.equal(unrecordedGains(measured(7), baseline()).improvements.length, 0)
  const current = measured()
  current.files['src/shared/helpers/new.ts'] = stats(0, 1)
  assert.deepEqual(unrecordedGains(current, baseline()).newFiles, ['src/shared/helpers/new.ts'])
})
test('new executable code gets no fabricated 100% floor from an empty prior metric', () => {
  assert.equal(coverageRegressions(measured(0, 1), { ...baseline(), ...measured(0, 0) }).length, 0)
})
test('validates baseline counters and scope rather than trusting edited aggregate percentages', () => {
  assert.ok(validateBaseline(baseline(), policy))
  for (const value of [
    null,
    { ...baseline(), version: 2 },
    { ...baseline(), reason: '' },
    { ...baseline(), policy: { include: [], exclude: [] } },
    { ...baseline(), global: stats(9) },
    { ...baseline(), modules: {} },
    { ...baseline(), files: {} },
  ])
    assert.throws(() => validateBaseline(value, policy))
})
test('editing committed floors, dropping an existing scope or narrowing the policy cannot silently bypass review', () => {
  assert.equal(baselineChanges(baseline(), null, measured(), policy).reductions.length, 0)
  assert.equal(baselineChanges(baseline(), baseline(), measured(), policy).reductions.length, 0)
  const reduced = { ...baseline(), ...measured(7) }
  assert.ok(baselineChanges(reduced, baseline(), measured(7), policy).reductions.length)
  const emptied = { ...baseline(), ...measured(0, 0) }
  assert.deepEqual(baselineChanges(emptied, baseline(), measured(), policy).removedFloors, [
    'src/shared/helpers/example.ts',
  ])
  assert.equal(
    baselineChanges(baseline(), baseline(), measured(), {
      ...policy,
      exclude: [...policy.exclude, 'src/views/**'],
    }).scopeChanged,
    true,
  )
})

const head = 'a'.repeat(40)
const review = (change = {}) => ({
  user: { type: 'User', login: 'reviewer' },
  author_association: 'COLLABORATOR',
  state: 'APPROVED',
  commit_id: head,
  ...change,
})
test('baseline reductions require a current human collaborator approval, not bots, authors, outsiders or stale approvals', () => {
  assert.equal(hasCurrentHumanApproval([review()], head, 'author'), true)
  for (const change of [
    { user: { type: 'Bot', login: 'bot' } },
    { user: { type: 'User', login: 'author' } },
    { author_association: 'NONE' },
    { commit_id: 'b'.repeat(40) },
    { state: 'DISMISSED' },
    { state: 'CHANGES_REQUESTED' },
  ])
    assert.equal(hasCurrentHumanApproval([review(change)], head, 'author'), false)
  assert.equal(
    hasCurrentHumanApproval([review(), review({ state: 'CHANGES_REQUESTED' })], head, 'author'),
    false,
  )
  assert.equal(
    hasCurrentHumanApproval([review(), review({ state: 'COMMENTED' })], head, 'author'),
    true,
  )
  assert.throws(() => hasCurrentHumanApproval(null, head, 'author'))
})
const pr = { number: 1, head: { sha: head }, user: { login: 'author' } }
const response = (rows) => ({ ok: true, json: async () => rows })
test('checks current PR and approved merge reviews without changing GitHub state', async () => {
  const event = { repository: { full_name: 'owner/repo' }, pull_request: pr }
  assert.equal(
    await reviewReduction(event, { token: 'test', request: async () => response([review()]) }),
    true,
  )
  const after = 'b'.repeat(40)
  assert.equal(
    await reviewReduction(
      { repository: event.repository, after },
      {
        token: 'test',
        request: async (url) =>
          response(
            url.includes('/commits/')
              ? [{ ...pr, merged_at: '2026-10-13', merge_commit_sha: after }]
              : [review()],
          ),
      },
    ),
    true,
  )
})
test('review retrieval fails closed on unavailable evidence, direct pushes and incomplete responses', async () => {
  const event = { repository: { full_name: 'owner/repo' }, pull_request: pr }
  for (const request of [
    async () => ({ ok: false }),
    async () => response({}),
    async () => {
      throw new Error('Network unavailable')
    },
  ])
    await assert.rejects(reviewReduction(event, { token: 'test', request }))
  await assert.rejects(reviewReduction(event, { token: '' }))
  await assert.rejects(
    reviewReduction(
      { repository: event.repository, after: 'b'.repeat(40) },
      { token: 'test', request: async () => response([]) },
    ),
  )
})
test('CI collects coverage, retains reports, and can verify review evidence without write permissions', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')
  const unit = workflow.slice(workflow.indexOf('  unit-tests:'), workflow.indexOf('  build:'))
  assert.match(unit, /fetch-depth: 0/)
  assert.match(unit, /pull-requests: read/)
  assert.doesNotMatch(unit, /: write/)
  assert.match(unit, /GITHUB_TOKEN: \$\{\{ github.token \}\}/)
  assert.match(unit, /coverage\//)
  assert.match(unit, /reports\/coverage-ratchet.json/)
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
  assert.match(pkg.scripts['test:unit:ci'], /--coverage.*coverage.mjs check/)
  assert.match(pkg.scripts.check, /test:coverage/)
})
