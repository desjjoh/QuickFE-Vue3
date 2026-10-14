# Frontend coverage and regression baseline

[Testing](testing.md) · [Observed baseline](coverage-baseline.md)

## Measurement

Vitest's V8 provider is installed at the same version as Vitest. The shared scope
in `test/coverage-policy.json` includes every `src/**/*.ts` and `src/**/*.vue`
file, including application entry points, routes, configuration, templates,
playground widgets, forms and views without isolated tests. There are no
exclusions for poorly covered feature areas.

Exclusions are test specifications, `__tests__` directories, fixture directories,
TypeScript declarations, and explicitly named `*.generated.ts` or
`*.generated.vue` sources. Test support, CI/build scripts, styles, images, fonts,
and translation JSON are outside the application TypeScript/Vue scope. Generated
SCSS is therefore outside this measurement as well. Type-only application files
remain listed but have no executable counters. Document any future scope change.

This measures the isolated frontend suite only. It does not merge Playwright or
live QuickAPI coverage, prove backend behavior, or claim that covered code has
adequate assertions. Vue source-map remapping can attribute compiled template
functions and branches to a component; inspect uncovered lines and behavior
alongside percentages.

## Commands and evidence

| Command                     | Purpose                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run coverage:report`   | Run the complete isolated suite with coverage; no baseline mutation.                     |
| `npm run test:coverage`     | Run the suite and then enforce the committed baseline.                                   |
| `npm run coverage:check`    | Validate an existing full report and enforce the baseline; does not rerun tests.         |
| `npm run coverage:baseline` | Generate an ignored baseline proposal for manual review; never replace committed floors. |
| `npm run check`             | Standard local verification, including the coverage run and gate.                        |

Reports include:

- Console file table and global summary.
- `coverage/index.html`: interactive file/line coverage.
- `coverage/coverage-summary.json`: global and per-file counters.
- `coverage/coverage-final.json`: detailed machine-readable hit data.
- `coverage/lcov.info`: tooling-compatible coverage data.
- `reports/coverage-ratchet.json`: global/module counters and any regressions.

CI's required unit-test job collects coverage and retains reports for 14 days,
even after failure. The unit job remains part of the aggregate `Check`.
Failed tests stop the command before a successful baseline check can mask them.
Missing, partial, malformed, extra-file or inconsistent summary evidence blocks
the gate. The report must match the current eligible source-file inventory.

## Observed floors and gradual targets

`test/coverage-baseline.json` stores exact covered/total counters for the global
scope, 83 modules and every eligible file. Modules separate component families,
shared APIs/helpers/hooks/stores, and feature UI/hooks/stores. The generated
[baseline table](coverage-baseline.md) makes the measurement reviewable.

The gate uses exact fractions, not rounded display percentages. Global, module,
and existing-file percentages may not fall below their committed floors. Gains
in another file cannot conceal an existing file's regression. New files still
affect the global and module denominators; they receive their own floor when a
reviewed snapshot is adopted. Improved percentages and new executable files must
be captured in the committed snapshot before the gate passes. This makes gains
the new floor immediately; they cannot later disappear while passing an obsolete
lower baseline. The command proposes that update without accepting it silently.
A previously empty executable metric is N/A and
does not impose a fabricated 100% per-file floor on newly added logic.

These initial observed floors are not a claim that the eventual targets have
been met. Raise them deliberately as behavior tests improve, toward 90%
statements/lines/functions and 85% branches. Critical authentication and request
modules will receive stronger focused targets in the next phase.

## Updating a baseline

1. Run `npm run coverage:report`, then `npm run coverage:baseline`.
2. Review `coverage/baseline-proposal.json` and `.md` against the committed
   snapshot and inspect changed branches. Include the actual rationale in the
   proposal's `reason` field.
3. Deliberately copy the accepted JSON to `test/coverage-baseline.json` and its
   table to `docs/coverage-baseline.md`, then format and commit both.
4. Run `npm run test:coverage` and submit the change for review.

There is no command that automatically lowers or overwrites the baseline.
Raising a floor is a normal reviewable change. On pull requests, CI also compares
the proposed baseline with the target branch's snapshot. Lowering a floor,
removing an existing executable floor, or changing coverage scope requires a new
written justification and an `APPROVED` review from a human owner/member/
collaborator other than the PR author on the current PR head commit. Bots,
outsiders, stale approvals, dismissals, and changes-requested reviews do not
qualify. After approval, rerun the failed unit job; no review-triggered workflow
or automatic approval is added.

Pushes introducing reductions must be associated with the reviewed merged PR.
Unreviewed direct-push and local reductions remain blocked. Changes to the
measurement engine or exclusion policy also need the scope/baseline review to
explain any new counters. GitHub review API errors fail closed. The unit job has
read-only PR access for this check; no review is posted or changed.

The first baseline is explicitly bootstrapped by this implementation because the
comparison commit has no earlier snapshot. Once merged, later baseline changes
are checked against the recorded Git history.

If a regression is intentional, document the specific behavior removed or
measurement change, and review the reduction rather than adjusting thresholds
until a build happens to pass. Keep remaining test work tied to actual uncovered
behavior and intentional risk.
