# Component and application test coverage

[Testing](testing.md) · [Inventory](test-inventory.md) · [Standards](testing-standards.md)

This pass expands behavior coverage across inputs, presentation, overlays, models,
API boundaries, and state. Direct suite references are evidence of targeted tests,
not an exhaustive branch-coverage guarantee. Existing E2E flows remain in place.

## Evidence map

| Area                           | Suites                                                                                   | Behavior verified                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inputs                         | `library/components/inputs/inputs.spec.ts`                                               | External value synchronization, emitted edits, validation failure/recovery, password visibility/focus, date normalization, readonly checkbox behavior, debounced search/clear, file selection/cancellation/type validation, queued picker cleanup, select keyboard/ARIA/teleport behavior                                |
| Presentation and composition   | `library/components/presentation.spec.ts`                                                | Button loading/disabled interaction, internal/external links, accessible icon labels, avatar errors/retry, escaped text, slots and child events, card optional regions, datalist empty/falsy values, timeline limits/placeholders, progress boundaries, form errors/actions, tab switching and recoverable render errors |
| Dropdowns, tooltips and toasts | `library/components/overlays.spec.ts`                                                    | Delayed opening, accessible descriptions, selection, persistent menus, disabled changes, timers, manual closure, unmount cleanup                                                                                                                                                                                         |
| Tables                         | Existing table/pagination specs                                                          | Row/all selection, selection cleanup, sorting intent and accessible sort state, loading/empty results, scroll scheduling, first/last navigation and the three-page window                                                                                                                                                |
| Overlay hosts and state        | `shared/stores/overlays.spec.ts`                                                         | Transition completion, multiple close waiters, replaced views, retained data cleanup, persistent dialogs, Escape, actual content composition, toast identity and missing-ID removal                                                                                                                                      |
| Sessions and activity          | `views/settings/stores/settings.spec.ts`, `views/administration/stores/activity.spec.ts` | Credentials, typed responses/pagination, denied access, error recovery, logout/page cleanup, old errors/responses, cleanup during pending credentials                                                                                                                                                                    |
| Authentication                 | `shared/stores/auth.spec.ts` plus existing interceptor tests                             | CSRF cache expiry, coalesced requests/refresh, credential rotation, rejection/retry, refresh lock cleanup, scoped/all permissions and roles                                                                                                                                                                              |
| References and preferences     | `shared/stores/reference-preferences.spec.ts`                                            | Atomic reference hydration, rejected partial updates, reset, theme persistence/document updates, supported and rejected locales                                                                                                                                                                                          |
| Models                         | Existing contract/article suites plus `library/models/boundaries.spec.ts`                | Nested hydration, nullability, dates, immutable raw payloads, token/MFA discrimination, empty pagination, malformed required contracts, home article routes/dates                                                                                                                                                        |
| API adapters                   | Existing adapter/article suites plus `shared/api/__tests__/failures.spec.ts`             | Cross-domain rejection propagation for 401/403/404/409/422/429/500, backend error details, network failure, invalid response contracts; existing version/key/upload/lifecycle contracts retained                                                                                                                         |

## Browser verification

`test/e2e/library.spec.ts` exercises the real playground components, focus traps,
Floating UI and CSS. Isolated overlay/select tests replace those browser libraries
where jsdom cannot represent geometry; browser checks supply the real interaction
evidence instead.

- Light and dark modes at 390px, 900px and 1600px.
- JSON syntax readability against composited theme backgrounds and line overflow.
- Offcanvas bounds after transitions, initial focus, Tab containment, Escape and
  restored trigger focus.
- Dropdown arrow/Home/End/Escape navigation, select choice/focus return, tooltip
  hover/dismissal, modal focus containment and navigation cleanup.
- Existing table browser checks retain desktop sticking, mobile release, edge-shadow
  alignment/height, tablet toolbar alignment and centered mobile pagination.
- Existing authenticated feature scenarios continue to use deterministic API fixtures.

The JSON check covers a syntax-key contrast regression, not a whole-page accessibility
audit. The playground includes wide demonstration tables, so its document width is
not treated as the production mobile-layout contract.

## Regression fixes discovered

- Date/password inputs now follow external controlled-value changes.
- Search clearing emits one update rather than duplicate updates.
- File-picker focus timers are cancelled on unmount.
- Nonfinite progress values/maxima no longer produce invalid accessible values.
- Repeated tooltip opening and disabling tooltip/dropdown components cancel or
  close pending/open content.
- Select inputs expose their combobox role; modal, offcanvas and toast close controls
  have translated accessible names.
- Locale changes update the document language as well as translations.

## Remaining work

The source inventory still records presentation/media/layout components without
direct isolated tests. Cover their meaningful behavior when extending those areas;
do not add empty snapshots merely to increase the file count. The home store is an
empty placeholder, and `email-otp.ts` contains types rather than runtime constructors.

Measured coverage thresholds, additional browser-engine enforcement, authenticated
live QuickAPI fixtures, and wider feature integration flows remain later work.
Current local browser evidence is Chromium; it does not establish Firefox/WebKit
passing results or prove every responsive/style condition.
