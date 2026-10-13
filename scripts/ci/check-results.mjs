import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const requiredJobs = [
  'formatting',
  'linting',
  'type-checking',
  'unit-tests',
  'build',
  'browser-tests',
]

export function evaluateChecks(results) {
  const rows = requiredJobs.map((name) => ({ name, result: results?.[name]?.result ?? 'missing' }))
  return { rows, passed: rows.every((row) => row.result === 'success') }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { rows, passed } = evaluateChecks(JSON.parse(process.env.CHECK_RESULTS ?? '{}'))
  let summary = '## Verification results\n\n| Check | Result |\n| --- | --- |\n'
  for (const { name, result } of rows) {
    console.log(`${name}: ${result}`)
    summary += `| ${name} | ${result} |\n`
  }
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary)
  if (!passed) process.exitCode = 1
}
