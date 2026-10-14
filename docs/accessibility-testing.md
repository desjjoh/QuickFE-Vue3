# Accessibility and keyboard regression checks

[Testing](testing.md) · [Playwright accessibility guidance](https://playwright.dev/docs/accessibility-testing)

## Scope and gate

The existing Chromium job runs accessibility and keyboard checks against the
built application using API fixtures. It remains required by the aggregate
`Check`. No backend account or separate scanning service is needed.

`test/e2e/fixtures.ts` supplies shared reference data and `checkAccessibility`.
The helper checks WCAG 2.0/2.1 A and AA rules with `@axe-core/playwright`, explicitly
checks visible dialog names, and fails on every returned violation. There are
no disabled rules, element exclusions or accepted-violation snapshots within
that rule set. Scans of individual controls/overlays are intentionally scoped;
the public shell also receives a full-page scan.

Scans wait for fonts and finite transitions, leaving infinite loading indicators
running. Tests wait for the requested UI state before scanning it. API responses
are held open explicitly when checking loading states; no arbitrary sleeps are
used to simulate slow requests.

## Established behavior protected

| Area                | Checks                                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forms               | Labels, invalid fields, password visibility via keyboard, retained password text, disabled loading controls, rejected sign-in and rejected verification states                    |
| Dialogs/offcanvases | Accessible names, complete forward/reverse focus cycles, Tab wrapping, close buttons, Escape, trigger restoration, repeated opening, and navigation cleanup                       |
| Persistent dialogs  | Escape/backdrop cannot dismiss verification; explicit cancellation works, rejected codes remain editable, and the original sign-in trigger regains focus after dialog replacement |
| Dropdown menus      | Arrow movement and wrapping, Home/End, disabled-item skipping, Enter/Space activation, Escape restoration, and native Tab/Shift+Tab exit                                          |
| Selects             | Active option IDs, wrapping, Home/End, Enter/Space selection, canceled-value preservation, remembered selections, disabled/empty states, and native Tab exit                      |
| Nested overlays     | Escape closes the active select before the offcanvas; closed or leaving selects do not consume the parent's Escape                                                                |
| Tabs                | One active tab stop, selected state, labeled content panels, wrapping arrows, Home/End, disabled-tab skipping and independent groups; route tabs also navigate by keyboard        |
| Tables              | Named row/select-all checkboxes and Space selection, keyboard sorting, pagination/page-size changes, and retained filter queries                                                  |
| Dates/tooltips      | Numeric date entry and formatting, focus-triggered tooltip descriptions, Escape dismissal and blur cleanup                                                                        |

Browser checks live in `test/e2e/keyboard.spec.ts`, `library.spec.ts` and
`vue.spec.ts`. Focus/keyboard unit tests accompany the relevant shared controls,
menu hook and overlay hosts. Shared overlay checks cover mobile and desktop;
existing light/dark checks retain mobile, tablet and desktop widths. Form scans
cover both themes. Administration scans cover tables, filter validation and audit
detail loading, failure, unavailable and loaded states.

## Running and reviewing failures

After building, reproduce the CI Chromium run using the commands in
[Testing](testing.md). To focus on the keyboard suite:

```powershell
node node_modules/@playwright/test/cli.js test test/e2e/keyboard.spec.ts --project=chromium
```

Every scan attaches JSON evidence with violations, passes and incomplete results
to the Playwright report. CI retains that report, failure screenshots and retry
traces for 14 days. Fix findings at the shared component or palette boundary
when appropriate; do not hide violations or replace keyboard assertions with
an axe scan. Incomplete results are retained for inspection and are not proof
that the corresponding accessibility requirement passed.

Pixel screenshot baselines are deliberately deferred while layouts are changing.
Failure screenshots are diagnostic artifacts; they do not create visual approval
snapshots or require routine baseline updates. Add a small reviewed visual suite
once the chosen layouts stabilize.

Automated checks do not establish full WCAG conformance. Screen-reader use,
meaningful reading order and accessible wording still need manual assessment.
