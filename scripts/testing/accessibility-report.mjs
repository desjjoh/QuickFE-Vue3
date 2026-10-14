import { appendFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export function summarizeScans(scans) {
  if (!scans.length) throw new Error('No accessibility scan evidence found')
  const findings = []
  let incompleteRules = 0
  for (const scan of scans) {
    if (!scan?.quickfe?.state || !Array.isArray(scan.violations) || !Array.isArray(scan.incomplete))
      throw new Error('Malformed accessibility scan evidence')
    incompleteRules += scan.incomplete.length
    for (const violation of scan.violations) {
      if (!violation?.id || !Array.isArray(violation.nodes))
        throw new Error('Malformed accessibility finding')
      findings.push({
        ...scan.quickfe,
        rule: violation.id,
        impact: violation.impact,
        help: violation.help,
        helpUrl: violation.helpUrl,
        affectedNodes: violation.nodes.length,
        targets: violation.nodes.map((node) => node.target),
      })
    }
  }
  return {
    policy: 'report-only',
    scans: scans.length,
    incompleteRules,
    ruleFindings: findings.length,
    affectedNodeOccurrences: findings.reduce((total, finding) => total + finding.affectedNodes, 0),
    findings,
  }
}

export function markdownSummary(report) {
  return `## Accessibility findings — report-only\n\n${report.scans} scans; **${report.ruleFindings} rule findings**, ${report.affectedNodeOccurrences} affected-node occurrences; ${report.incompleteRules} incomplete rules requiring review. Counts include repeated states/retries.\n\nDetected WCAG findings do not block this run. Functional/keyboard assertions and scan/evidence failures still block. A green job does not establish WCAG conformance.\n\n| Test | State | Browser | Retry | Rule | Impact | Nodes |\n|---|---|---|---|---|---|---|\n${report.findings.map((finding) => `| ${escapeCell(finding.test)} | ${escapeCell(finding.state)} | ${escapeCell(finding.project)} | ${finding.retry} | ${escapeCell(finding.rule)} | ${escapeCell(finding.impact ?? 'unknown')} | ${finding.affectedNodes} |`).join('\n')}\n\nFull selectors, rule guidance, passes and incomplete results are retained in the browser artifacts.\n`
}

function escapeCell(value) {
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/[\r\n]/g, ' ')
}

function evidenceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory()
      ? evidenceFiles(path)
      : entry.name.endsWith('-axe.json')
        ? [path]
        : []
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const scans = evidenceFiles(resolve('test-results')).map((path) =>
      JSON.parse(readFileSync(path, 'utf8')),
    )
    const report = summarizeScans(scans)
    const markdown = markdownSummary(report)
    mkdirSync('reports', { recursive: true })
    writeFileSync('reports/accessibility-summary.json', JSON.stringify(report, null, 2) + '\n')
    writeFileSync('reports/accessibility-summary.md', markdown)
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown)
    // Detailed findings belong in artifacts and the CI summary, not noisy console logs.
  } catch (error) {
    console.error(`Accessibility reporting failed: ${error.message}`)
    process.exitCode = 1
  }
}
