import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  summarizeScans,
  markdownSummary,
} from '../../../../scripts/testing/accessibility-report.mjs'

const scan = (violations = []) => ({
  quickfe: { test: 'Sign-in', state: 'default', project: 'chromium', retry: 0 },
  violations,
  incomplete: [],
})
test('reports WCAG findings without treating them as a failed scan', () => {
  const report = summarizeScans([
    scan([{ id: 'color-contrast', impact: 'serious', nodes: [{ target: ['.button-link'] }] }]),
  ])
  assert.equal(report.policy, 'report-only')
  assert.equal(report.ruleFindings, 1)
  assert.equal(report.affectedNodeOccurrences, 1)
  assert.deepEqual(report.findings[0].targets, [['.button-link']])
  assert.match(markdownSummary(report), /color-contrast/)
})
test('retains clean and incomplete scan evidence without claiming compliance', () => {
  const report = summarizeScans([scan(), { ...scan(), incomplete: [{ id: 'color-contrast' }] }])
  assert.equal(report.scans, 2)
  assert.equal(report.ruleFindings, 0)
  assert.equal(report.incompleteRules, 1)
  assert.match(markdownSummary(report), /does not establish WCAG conformance/)
})
test('rejects missing or malformed evidence rather than silently passing', () => {
  for (const scans of [
    [],
    [null],
    [{}],
    [{ ...scan(), violations: null }],
    [scan([{ id: 'bad' }])],
  ])
    assert.throws(() => summarizeScans(scans))
})
