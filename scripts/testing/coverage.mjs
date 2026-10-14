import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

export const metrics = ['statements', 'lines', 'functions', 'branches']
// Per-file floors prevent a well-covered neighbor from hiding a critical gap.
export const criticalModules = {
  authentication: [
    'src/shared/stores/auth.ts',
    'src/shared/hooks/useSessionInterceptor.ts',
    'src/app/hooks/useAppActions.ts',
  ],
  authorization: ['src/config/permissions.ts', 'src/shared/helpers/route-access.ts'],
  requests: [
    'src/shared/helpers/request.ts',
    'src/shared/helpers/idempotency.ts',
    'src/shared/helpers/api-queries.ts',
    'src/shared/hooks/usePaginatedQuery.ts',
  ],
  actions: [
    'src/shared/hooks/useModalSubmit.ts',
    'src/views/settings/hooks/useAccountActions.ts',
    'src/views/settings/hooks/useProfileActions.ts',
    'src/views/settings/hooks/useSessionsActions.ts',
  ],
  stores: [
    'src/views/administration/stores/activity.ts',
    'src/views/administration/stores/users.ts',
    'src/views/profile/stores/profile.ts',
    'src/views/settings/stores/settings.ts',
  ],
}
export const criticalThresholds = { statements: 95, lines: 95, functions: 95, branches: 90 }

export function criticalCoverage(files) {
  requireValid(object(files), 'Missing critical coverage evidence')
  const failures = []
  const modules = {}
  for (const [group, paths] of Object.entries(criticalModules)) {
    modules[group] = {}
    for (const path of paths) {
      const stats = validateStats(files[path], path)
      modules[group][path] = stats
      for (const metric of metrics) {
        const { covered, total } = stats[metric]
        // Zero executable counters must not satisfy a critical contract silently.
        requireValid(total > 0, `Empty critical ${metric} evidence: ${path}`)
        if (covered * 100 < total * criticalThresholds[metric])
          failures.push({
            group,
            file: path,
            metric,
            threshold: criticalThresholds[metric],
            covered,
            total,
          })
      }
    }
  }
  return { thresholds: criticalThresholds, modules, failures }
}
const root = fileURLToPath(new URL('../../', import.meta.url))
  .replaceAll('\\', '/')
  .replace(/\/$/, '')
const baselinePath = 'test/coverage-baseline.json'
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
function requireValid(condition, message) {
  if (!condition) throw new Error(message)
}
const empty = () => Object.fromEntries(metrics.map((metric) => [metric, { covered: 0, total: 0 }]))

export function globMatches(file, pattern) {
  let expression = '^'
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index]
    if (char === '*' && pattern[index + 1] === '*') {
      index++
      if (pattern[index + 1] === '/') {
        expression += '(?:.*/)?'
        index++
      } else expression += '.*'
    } else if (char === '*') expression += '[^/]*'
    else expression += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(expression + '$').test(file)
}

export function eligible(file, policy) {
  return (
    policy.include.some((pattern) => globMatches(file, pattern)) &&
    !policy.exclude.some((pattern) => globMatches(file, pattern))
  )
}

export function moduleName(file) {
  const parts = file.split('/')
  const length = file.startsWith('src/library/components/') || file.startsWith('src/views/') ? 4 : 3
  return parts.slice(0, Math.min(length, parts.length - 1)).join('/')
}

export function normalizeCoveragePath(file, projectRoot) {
  const normalized = file.replaceAll('\\', '/')
  const prefix = projectRoot.replaceAll('\\', '/').replace(/\/$/, '') + '/'
  const relative = normalized.startsWith(prefix) ? normalized.slice(prefix.length) : normalized
  requireValid(
    relative.startsWith('src/') &&
      !relative.split('/').some((part) => ['.', '..', ''].includes(part)),
    `Unexpected coverage path: ${file}`,
  )
  return relative
}

function validateStats(stats, label) {
  requireValid(object(stats), `Missing coverage counters: ${label}`)
  const result = empty()
  for (const metric of metrics) {
    const row = stats[metric]
    requireValid(
      object(row) &&
        Number.isSafeInteger(row.total) &&
        Number.isSafeInteger(row.covered) &&
        row.covered >= 0 &&
        row.total >= row.covered,
      `Invalid ${metric} counters: ${label}`,
    )
    result[metric] = { covered: row.covered, total: row.total }
  }
  return result
}

function aggregate(files) {
  const global = empty()
  const modules = {}
  for (const [file, stats] of Object.entries(files)) {
    const name = moduleName(file)
    modules[name] ??= empty()
    for (const metric of metrics) {
      for (const key of ['covered', 'total']) {
        global[metric][key] += stats[metric][key]
        modules[name][metric][key] += stats[metric][key]
      }
    }
  }
  return {
    global,
    modules: Object.fromEntries(Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))),
  }
}

export function measuredCoverage(summary, sources, projectRoot) {
  requireValid(object(summary) && object(summary.total), 'Missing coverage summary')
  const files = {}
  for (const [path, stats] of Object.entries(summary)) {
    if (path === 'total') continue
    const file = normalizeCoveragePath(path, projectRoot)
    requireValid(!files[file], `Duplicate coverage path: ${file}`)
    files[file] = validateStats(stats, file)
  }
  requireValid(
    sources.length > 0 && sources.length === new Set(sources).size,
    'Empty or duplicate source inventory',
  )
  const expected = [...sources].sort()
  requireValid(
    JSON.stringify(Object.keys(files).sort()) === JSON.stringify(expected),
    'Coverage report does not include exactly the eligible application files',
  )
  const totals = aggregate(files)
  const reported = validateStats(summary.total, 'total')
  requireValid(
    JSON.stringify(reported) === JSON.stringify(totals.global),
    'Coverage totals disagree with file counters',
  )
  return {
    ...totals,
    files: Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b))),
  }
}

export function validateBaseline(baseline, policy) {
  requireValid(
    object(baseline) &&
      baseline.version === 1 &&
      baseline.provider === 'v8' &&
      typeof baseline.reason === 'string' &&
      baseline.reason.trim().length > 0,
    'Invalid coverage baseline metadata',
  )
  requireValid(
    JSON.stringify(baseline.policy) === JSON.stringify(policy),
    'Coverage scope changed: review policy and baseline together',
  )
  requireValid(
    object(baseline.files) && Object.keys(baseline.files).length > 0,
    'Missing baseline files',
  )
  const files = {}
  for (const [file, stats] of Object.entries(baseline.files)) {
    requireValid(
      normalizeCoveragePath(file, '') === file && eligible(file, policy),
      `Invalid baseline scope: ${file}`,
    )
    files[file] = validateStats(stats, file)
  }
  const totals = aggregate(files)
  requireValid(
    JSON.stringify(validateStats(baseline.global, 'baseline total')) ===
      JSON.stringify(totals.global),
    'Invalid baseline totals',
  )
  requireValid(
    object(baseline.modules) &&
      JSON.stringify(Object.keys(baseline.modules).sort()) ===
        JSON.stringify(Object.keys(totals.modules).sort()),
    'Invalid baseline modules',
  )
  for (const [name, stats] of Object.entries(totals.modules))
    requireValid(
      JSON.stringify(validateStats(baseline.modules[name], name)) === JSON.stringify(stats),
      `Invalid baseline module totals: ${name}`,
    )
  return { ...baseline, ...totals, files }
}

export function percentage(row) {
  return row.total === 0 ? null : Math.floor((row.covered * 10000) / row.total) / 100
}

export function coverageRegressions(current, baseline) {
  const regressions = []
  function compare(scope, actual, floor) {
    for (const metric of metrics) {
      const old = floor[metric]
      const next = actual[metric]
      if (old.total === 0) continue
      if (next.total === 0) continue // Removal of executable code, not an uncovered new branch.
      if (BigInt(next.covered) * BigInt(old.total) < BigInt(old.covered) * BigInt(next.total))
        regressions.push({ scope, metric, baseline: percentage(old), current: percentage(next) })
    }
  }
  compare('global', current.global, baseline.global)
  for (const [name, floor] of Object.entries(baseline.modules))
    if (current.modules[name]) compare(`module:${name}`, current.modules[name], floor)
  for (const [file, floor] of Object.entries(baseline.files))
    if (current.files[file]) compare(`file:${file}`, current.files[file], floor)
  return regressions
}

export function unrecordedGains(current, baseline) {
  const improvements = coverageRegressions(baseline, current).map((row) => ({
    ...row,
    baseline: row.current,
    current: row.baseline,
  }))
  const newFiles = Object.keys(current.files).filter(
    (file) =>
      !baseline.files[file] && metrics.some((metric) => current.files[file][metric].total > 0),
  )
  return { improvements, newFiles }
}

export function baselineChanges(baseline, previous, current, policy) {
  if (!previous) return { reductions: [], scopeChanged: false, removedFloors: [] }
  return {
    reductions: coverageRegressions(baseline, validateBaseline(previous, previous.policy)),
    scopeChanged: JSON.stringify(previous.policy) !== JSON.stringify(policy),
    removedFloors: Object.keys(previous.files).filter(
      (file) =>
        current.files[file] &&
        (!baseline.files[file] ||
          metrics.some(
            (metric) =>
              previous.files[file][metric].total > 0 &&
              baseline.files[file][metric].total === 0 &&
              current.files[file][metric].total > 0,
          )),
    ),
  }
}

export function sourceFiles(policy) {
  const files = []
  function walk(directory) {
    for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true })) {
      const file = `${directory}/${entry.name}`
      if (entry.isDirectory()) walk(file)
      else if (eligible(file, policy)) files.push(file)
    }
  }
  walk('src')
  return files.sort()
}

export function markdownBaseline(baseline) {
  const values = (stats) =>
    metrics
      .map((metric) =>
        stats[metric].total === 0 ? 'N/A' : `${percentage(stats[metric]).toFixed(2)}%`,
      )
      .join(' | ')
  const table = [
    '| Module | Statements | Lines | Functions | Branches |',
    '| --- | --- | --- | --- | --- |',
    `| **Global** | ${values(baseline.global)} |`,
    ...Object.entries(baseline.modules).map(([name, stats]) => `| ${name} | ${values(stats)} |`),
  ].join('\n')
  return `# Observed frontend coverage baseline\n\n[Coverage policy and workflow](coverage.md) · [Testing](testing.md)\n\nMeasured with Vitest ${baseline.vitest} and V8 across ${Object.keys(baseline.files).length} eligible application files. This measures the isolated frontend suite; Playwright and live backend tests do not contribute. Untested application code is included. N/A means no executable counters for that metric.\n\n${table}\n\nThe exact covered/total counters, including every file, are stored in \`test/coverage-baseline.json\`. These are initial regression floors, not the eventual targets: 90% statements/lines/functions and 85% branches. New code remains subject to the global and module floors; existing files also cannot regress. Baseline proposals never overwrite the committed floor automatically.\n`
}

function gitBaseline(ref) {
  const commit = spawnSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], {
    cwd: root,
    encoding: 'utf8',
  })
  requireValid(commit.status === 0, `Cannot resolve coverage comparison commit: ${ref}`)
  const exists = spawnSync('git', ['cat-file', '-e', `${ref}:${baselinePath}`], {
    cwd: root,
    encoding: 'utf8',
  })
  if (exists.status !== 0) return null
  const result = spawnSync('git', ['show', `${ref}:${baselinePath}`], {
    cwd: root,
    encoding: 'utf8',
  })
  requireValid(result.status === 0, 'Cannot read base coverage policy')
  return JSON.parse(result.stdout)
}

export function hasCurrentHumanApproval(reviews, headSha, author) {
  requireValid(Array.isArray(reviews), 'Malformed baseline review evidence')
  const decisions = new Map()
  for (const review of reviews) {
    if (
      review.user?.type !== 'User' ||
      review.user.login === author ||
      !['OWNER', 'MEMBER', 'COLLABORATOR'].includes(review.author_association)
    )
      continue
    if (['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state))
      decisions.set(review.user.login, review)
  }
  return [...decisions.values()].some(
    (review) => review.state === 'APPROVED' && review.commit_id === headSha,
  )
}

export async function reviewReduction(
  event,
  { token = process.env.GITHUB_TOKEN, request = fetch } = {},
) {
  requireValid(
    event && token,
    'Baseline reductions require a human approval on the current PR commit; local or unreviewed direct-push reductions are blocked',
  )
  const repository = event.repository?.full_name
  requireValid(
    typeof repository === 'string' && /^[\w.-]+\/[\w.-]+$/.test(repository),
    'Missing PR review context',
  )
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  let pr = event.pull_request
  if (!pr && typeof event.after === 'string' && /^[a-f0-9]{40}$/.test(event.after)) {
    const response = await request(
      `https://api.github.com/repos/${repository}/commits/${event.after}/pulls?per_page=100`,
      { headers, signal: AbortSignal.timeout(30_000) },
    )
    requireValid(response.ok, 'Unable to verify merged baseline review')
    const rows = await response.json()
    requireValid(Array.isArray(rows) && rows.length < 100, 'Incomplete merged PR evidence')
    pr = rows.find((row) => row.merged_at && row.merge_commit_sha === event.after)
  }
  requireValid(pr && Number.isInteger(pr.number), 'Unreviewed direct-push baseline reduction')
  const reviews = []
  for (let page = 1; page <= 20; page++) {
    const response = await request(
      `https://api.github.com/repos/${repository}/pulls/${pr.number}/reviews?per_page=100&page=${page}`,
      { headers, signal: AbortSignal.timeout(30_000) },
    )
    requireValid(response.ok, 'Unable to verify human baseline approval')
    const rows = await response.json()
    requireValid(Array.isArray(rows), 'Malformed PR review evidence')
    reviews.push(...rows)
    if (rows.length < 100) return hasCurrentHumanApproval(reviews, pr.head.sha, pr.user.login)
  }
  throw new Error('PR review evidence exceeded pagination limit')
}

async function main() {
  try {
    const mode = process.argv[2]
    requireValid(['check', 'propose'].includes(mode), 'Use coverage.mjs check or propose')
    const policy = JSON.parse(readFileSync(resolve(root, 'test/coverage-policy.json'), 'utf8'))
    requireValid(
      object(policy) && Array.isArray(policy.include) && Array.isArray(policy.exclude),
      'Invalid coverage policy',
    )
    const current = measuredCoverage(
      JSON.parse(readFileSync(resolve(root, 'coverage/coverage-summary.json'), 'utf8')),
      sourceFiles(policy),
      root,
    )
    if (mode === 'propose') {
      const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'))
      const proposal = {
        version: 1,
        provider: 'v8',
        vitest: lock.packages['node_modules/vitest'].version,
        reason: 'Initial observed baseline; later updates must describe the reviewed change.',
        policy,
        ...current,
      }
      writeFileSync(
        resolve(root, 'coverage/baseline-proposal.json'),
        JSON.stringify(proposal, null, 2) + '\n',
      )
      writeFileSync(resolve(root, 'coverage/baseline-proposal.md'), markdownBaseline(proposal))
      console.log(
        'Wrote coverage/baseline-proposal.json and .md for review. Committed baseline unchanged.',
      )
      return
    }
    const baseline = validateBaseline(
      JSON.parse(readFileSync(resolve(root, baselinePath), 'utf8')),
      policy,
    )
    const regressions = coverageRegressions(current, baseline)
    const critical = criticalCoverage(current.files)
    const gains = unrecordedGains(current, baseline)
    const event = process.env.GITHUB_EVENT_PATH
      ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
      : null
    const before =
      event?.pull_request?.base?.sha ??
      (event?.before && !/^0+$/.test(event.before) ? event.before : 'HEAD')
    const previous = gitBaseline(before)
    const {
      reductions: baselineReductions,
      scopeChanged: changedPolicy,
      removedFloors,
    } = baselineChanges(baseline, previous, current, policy)
    if (baselineReductions.length || changedPolicy || removedFloors.length) {
      requireValid(
        baseline.reason.trim() !== previous.reason.trim(),
        'Baseline reductions or scope changes require a new review justification',
      )
      requireValid(
        await reviewReduction(event),
        'No current human approval for the coverage baseline reduction or scope change',
      )
    }
    mkdirSync(resolve(root, 'reports'), { recursive: true })
    const result = {
      passed:
        regressions.length === 0 &&
        critical.failures.length === 0 &&
        gains.improvements.length === 0 &&
        gains.newFiles.length === 0,
      critical,
      global: current.global,
      modules: current.modules,
      regressions,
      unrecordedGains: gains,
      baselineReductions,
      reviewedScopeChange: Boolean(changedPolicy),
      reviewedRemovedFloors: removedFloors,
    }
    writeFileSync(
      resolve(root, 'reports/coverage-ratchet.json'),
      JSON.stringify(result, null, 2) + '\n',
    )
    console.log(
      `Coverage baseline: ${result.passed ? 'passed' : 'BLOCKED'}; ${Object.keys(current.files).length} files, ${Object.keys(current.modules).length} modules.`,
    )
    if (gains.improvements.length || gains.newFiles.length)
      console.error(
        'Coverage improved or new executable files were added: run npm run coverage:baseline and commit the reviewed proposal so these gains become the new floor.',
      )
    for (const row of regressions)
      console.error(`${row.scope} ${row.metric}: ${row.current}% < ${row.baseline}%`)
    for (const row of critical.failures)
      console.error(
        `Critical ${row.file} ${row.metric}: ${row.covered}/${row.total} < ${row.threshold}%`,
      )
    if (process.env.GITHUB_STEP_SUMMARY)
      writeFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `\n## Coverage baseline\n\n${result.passed ? 'Passed' : 'Blocked'}; ${regressions.length} regressions.\n\n${metrics.map((metric) => `${metric}: ${percentage(current.global[metric])}%`).join(' · ')}\n`,
        { flag: 'a' },
      )
    if (!result.passed) process.exitCode = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    mkdirSync(resolve(root, 'reports'), { recursive: true })
    writeFileSync(
      resolve(root, 'reports/coverage-ratchet.json'),
      JSON.stringify({ passed: false, error: message }, null, 2) + '\n',
    )
    console.error(`Coverage baseline blocked: ${message}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
