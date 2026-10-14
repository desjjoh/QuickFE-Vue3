import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { evaluateChecks, requiredJobs } from '../../../../scripts/ci/check-results.mjs'

const success = () => Object.fromEntries(requiredJobs.map((name) => [name, { result: 'success' }]))
test('accepts only a complete set of successful checks', () => {
  assert.equal(evaluateChecks(success()).passed, true)
  assert.equal(evaluateChecks({}).passed, false)
})
for (const state of ['failure', 'cancelled', 'skipped', 'missing']) {
  test(`blocks every job when ${state}`, () => {
    for (const name of requiredJobs) {
      const results = success()
      if (state === 'missing') delete results[name]
      else results[name].result = state
      assert.equal(evaluateChecks(results).passed, false, name)
    }
  })
}
test('gate CLI exits unsuccessfully on missing or malformed evidence', () => {
  for (const evidence of ['{}', '{malformed']) {
    const run = spawnSync(
      process.execPath,
      [fileURLToPath(new URL('../../../../scripts/ci/check-results.mjs', import.meta.url))],
      {
        env: { ...process.env, CHECK_RESULTS: evidence, GITHUB_STEP_SUMMARY: '' },
        encoding: 'utf8',
      },
    )
    assert.notEqual(run.status, 0)
  }
})
test('workflow retains the required Check context and every gate dependency', () => {
  const workflow = readFileSync(
    new URL('../../../../.github/workflows/ci.yml', import.meta.url),
    'utf8',
  )
  for (const event of ['pull_request', 'push'])
    assert.match(workflow, new RegExp(`${event}:\\s+branches: \\[main, staging, dev\\]`))
  const gate = workflow.slice(workflow.indexOf('  check:'))
  assert.match(gate, /name: Check\s+if: always\(\)/)
  const needs = gate
    .match(/needs:\s*\[([^\]]+)\]/)?.[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  assert.deepEqual(needs, requiredJobs)
  assert.match(gate, /run: node scripts\/ci\/check-results.mjs/)
})
