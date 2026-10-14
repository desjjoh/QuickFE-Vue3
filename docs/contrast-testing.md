# Component colour and contrast inventory

[Back to testing](testing.md)

This bounded browser matrix measures existing component CSS without changing the
theme. It covers light and dark modes on neutral palette steps 1, 2 and 3:
page (`bg.canvas`), card (`bg.page`) and modal (`bg.surface`). These are not the
`surface-2` and `surface-3` tokens, which use steps 5 and 7.

The matrix samples rendered playground links, link buttons, all six tones of the
five button variants, all six tones of the four badge variants, and solid/soft
avatar fallbacks in all six tones. Every combination is measured at rest. Links,
link buttons and button variants in **every tone** are additionally measured on
hover and keyboard focus. Links and link buttons must have matching foreground colours. Missing
component samples or invalid measurements fail the tests.

Basic typography covers the production primary, secondary, tertiary and muted
text tokens, plus text steps 11 and 12 for primary, neutral, success, warning,
danger and info tones. Each is measured at 12px and 14px with normal (400) and
semibold (600) weights on every layer in both modes. The font family is inherited
from the application; the test does not replace its text colours or fonts.

The test temporarily clones rendered examples into an isolated browser container
with the selected background token. Production classes and scoped CSS attributes
are preserved; event handlers are not. This tests CSS presentation rather than
Vue interaction behaviour, which remains covered by the keyboard suite.

Each report records the actual foreground, composited background, font family,
font size and weight, WCAG 2 contrast ratio and size-dependent AA threshold, APCA
Lc, and APCA reference-font minimum size. Transparent colours are composited
through ancestor backgrounds. Gradients and element/group opacity require
separate analysis and fail measurement rather than silently reporting a pass.

APCA uses the pinned development-only `apca-w3` calculator. Its font lookup is
reference guidance, not a validated Nunito Sans typography assessment. An Lc 60
score alone does not establish an accessible pairing at every text size.

## Reporting policy

This is an **inventory**, not a new contrast-compliance gate. WCAG failures are
reported, not silently accepted as exceptions. A green inventory test means
samples were measured and presentation assertions passed; it does not mean all
samples passed contrast. Axe findings are also temporarily report-only, as
documented in [Accessibility testing](accessibility-testing.md); failed scans
and functional assertions remain blocking.

Review the findings before defining a regression baseline or accepted exceptions.
No colour changes, lower thresholds, blanket axe exclusions or automatic baseline
updates are introduced here.

## Running and evidence

For production-build evidence:

```powershell
npm run build-only
$env:CI = 'true'
$env:QUICKAPI_E2E_LIVE = '0'
$env:QUICKFE_E2E_PORT = '5175'
npm run test:contrast
Remove-Item Env:CI, Env:QUICKAPI_E2E_LIVE, Env:QUICKFE_E2E_PORT
```

The six cases also run as part of the normal Chromium suite. Each attaches a
complete JSON inventory and a Markdown table of WCAG failures. JSON files are
also saved in each case's `test-results` directory. The existing browser CI job
retains these results and the HTML report for 14 days.

This first pass does not cover disabled/loading controls, selected dropdown or
listbox options, form inputs, icon-only contrast, focus-ring contrast, body copy,
JSON tokens, images, heading sizes, or every application screen. Those are
explicit expansion candidates rather than implied coverage.

## Initial local observations — October 14, 2026

The production-build Chromium run recorded 84 measurements per case, 504 total:

| Theme                | Page: step 1 | Card: step 2 | Modal: step 3 |
| -------------------- | -----------: | -----------: | ------------: |
| Light: WCAG findings |            9 |           11 |            13 |
| Dark: WCAG findings  |            4 |            4 |             4 |

Counts include repeated component/state combinations across layers; they are not
45 unique defects. Solid success/danger buttons and badges fail in both themes.
Light mode also reports neutral solid controls/avatar fallback and some primary,
success and warning links. The exact pairings and typography are in the JSON
evidence. These observations do not approve exceptions or establish whole-app
compliance. Re-run against the intended revision when reviewing theme changes.

APCA methodology and typography guidance come from the
[official implementation](https://github.com/Myndex/apca-w3) and
[APCA guidance](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell).

### Expanded all-tone and typography run

The expanded run recorded 226 measurements per case, 1,356 total. All six
measurement cases passed their sampling and link-parity assertions:

| Theme                | Page: step 1 | Card: step 2 | Modal: step 3 |
| -------------------- | -----------: | -----------: | ------------: |
| Light: WCAG findings |           31 |           37 |            43 |
| Dark: WCAG findings  |           17 |           17 |            17 |

Basic primary and secondary text passed on all three layers in both modes at the
tested sizes/weights. Tertiary and muted text failed the 4.5:1 content-text
threshold throughout. Tertiary ratios were 3.706–3.789 in light and 4.191–4.385 in
dark; muted ratios were 3.223–3.302 in light and 3.528–3.628 in dark. Increasing
from normal to semibold at 12px or 14px does not change the WCAG threshold.

These are content-text measurements. Actual disabled or incidental content can
have different applicability; no automatic exception is inferred from a token
being named `muted`. The increase from the first run reflects broader sampling,
not a theme change made by these tests.
