# Testing standards and expansion plan

[Testing](testing.md) · [Source inventory](test-inventory.md)

## Baseline and scope

The inventory maps every helper, hook, Vue component/view/layout, library model,
API adapter, and store to discoverable test imports. It includes feature-level
helpers/hooks and component input hooks. Type-only imports, mocks, and import
chains do not establish behavioral coverage. Review assertions before marking a
scenario complete. Browser tests exercise routes rather than importing their
components; their existing coverage is tracked separately and remains valuable.

Refresh the inventory with `npm run test:inventory`. The output also lists existing
suite scenario titles. `node scripts/testing/inventory.mjs --check` checks whether
the generated map is current. The inventory remains distinct from
[measured coverage and enforced regression floors](coverage.md).

## Prioritized behavior backlog

Each row below is **partial** where existing tests are listed, and **pending**
where no focused suite exists. Imported dependencies remain pending until their
public behavior is asserted directly. Priorities favor reuse, stateful behavior,
permissions, and user input rather than file size or desired test counts.

| Priority | Area                                                                                | Existing evidence                                                   | Missing scenarios to review or add                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Request, idempotency, route-access and reference helpers                            | Adapter/query tests reach some helpers                              | Rejected requests, cancellation, header preservation, explicit/reused keys, denied access, unknown references, immutable inputs                                             |
| P1       | Date, phone, JSON, string, object, time and timezone helpers                        | Date/phone/query suites; JSON viewer tests exercise formatting      | Null/empty/invalid values, boundaries, offsets, Unicode, cycles, nested data, mutation checks; review date expectations in a fixed timezone                                 |
| P1       | Session interceptor, permissions, presentation and translations                     | Session retry and role/status presentation suites                   | Concurrent unauthorized requests, failed refresh, session loss mid-request, unknown translations/domain values, permission combinations                                     |
| P1       | Pagination, search, debounce, storage and viewport hooks                            | Pagination URL tests                                                | Cancellation/unmount, latest arguments, malformed stored JSON, storage failures, URL arrays/defaults, reactive breakpoint changes                                           |
| P1       | Form, text-field, modal-submit and overlay-flow hooks                               | Feature form-action tests                                           | Validation failures, rejected callbacks, repeat submission, loading recovery, dismissal during pending work                                                                 |
| P1       | Floating/select/dismissable overlays and readiness/progress hooks                   | Page-progress suite; E2E modal/filter interactions                  | Keyboard navigation, outside click, Escape, focus restoration, nested overlays, listener/observer cleanup, reordered responses                                              |
| P1       | Inputs and form layouts                                                             | Browser sign-in/filter controls                                     | Value/event contracts, empty/disabled/readonly/invalid states where supported, paste and keyboard behavior, max/min boundaries, accessible labels, file rejection and reset |
| P1       | Tables and pagination                                                               | Scroll/resize cleanup and page-window suites; responsive E2E checks | Selection changes, sorting, loading/empty state, missing slots, take updates, first/last boundaries; browser-only overflow/scrollbar/theme regressions                      |
| P1       | Modal/offcanvas/dropdown/tab hosts and stores                                       | Feature E2E opening/closing and audit-detail lifecycle              | Repeated opening, nested ownership, stale close, focus trap/restoration, route changes, keyboard dismissal, unmount cleanup                                                 |
| P1       | Auth, settings, administration, profile and reference stores                        | Profile/users store tests; action and cleanup suites                | Failure recovery, logout clearing, parallel loaders, stale writes, permission changes, version conflicts, idempotency reuse across retries                                  |
| P1       | DTOs and API adapters                                                               | Model contracts, adapter and article suites                         | Review every exported DTO and endpoint individually: nested dates, nullability, defaults, malformed optional fields, headers/query/body, errors and bodyless responses      |
| P2       | JSON viewer, timeline, datalist, text, buttons, links, badges, avatars and progress | JSON viewer suite and some feature/browser use                      | Missing/long content, event forwarding, loading/disabled states, fallback values, conditional rendering, translated labels, keyboard behavior where interactive             |
| P2       | Cards, grids, media, navigation and application views                               | Existing route/browser scenarios                                    | Slot contracts, conditional content, missing media, error fallbacks and permission-dependent navigation; avoid tests that merely restate CSS                                |
| P3       | Playground and template examples                                                    | Playground manual/browser examples                                  | Keep representative examples usable; prioritize production components before duplicating showcase tests                                                                     |

For each item, record happy paths, failure paths, empty/loading/disabled states,
boundary cases, lifecycle cleanup, accessibility and browser-only behavior where
applicable. Mark unsupported states as not applicable with a reason. A constructor
test or snapshot is not enough to claim a model/component is fully tested.

## Shared support

Reusable helpers live in `test/support`, imported through `@test/support`:

| Helper                    | Purpose                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `buildUser`, `buildAudit` | Independent cloned JSON contracts, with typed shallow overrides; nested overrides must supply the complete nested shape |
| `mountLibrary`            | Real Vue component mount with fresh Pinia and library translations; accepts normal mount options and additional plugins |
| `mountHook`               | Run a composable inside a real setup/unmount lifecycle; returns its result and wrapper                                  |
| `createTestPlugins`       | Fresh Pinia/i18n instances; explicitly select English, French or Spanish when testing translations                      |
| `createTestRouter`        | Isolated memory router with explicit routes and initial location                                                        |
| `deferred`                | Explicitly resolve/reject pending work to verify races, failures and cleanup                                            |
| `useTestClock`            | Fixed system time and asynchronous timer advancement; opt in only for timer-dependent tests                             |
| `mockAnimationFrames`     | Flush one frame at a time, retain newly queued frames, and observe cancellation                                         |
| `setTestViewport`         | Update the existing `useViewport` hook through a real resize event                                                      |

The existing adapter fixture file remains the contract baseline. Prefer the
builders when a test mutates or customizes fixtures. Add typed builders alongside
them as additional domains need them. Do not reuse mutable DTOs across tests.
Use fresh DTO constructors on top of JSON builders when exercising hydration.

Mount helpers supply the real application messages for English, French and Spanish.
Feature tests may supply explicit translation mocks when isolating a different boundary. Supply routers only when
needed, and mock external services rather than silently stubbing the component
under test. Layout-sensitive tests belong in Playwright, not jsdom geometry.

## Determinism and cleanup

- Vitest automatically unmounts test-utils wrappers after each test.
- Mock call history, spies, stubbed globals and environment values reset between tests.
- Global teardown clears local/session storage and restores real timers after timer tests.
- Unmount and assert cleanup explicitly when cleanup is the behavior under test;
  automatic teardown is only a safety net.
- Use fake timers and deferred promises instead of sleeping or increasing timeouts.
- Use fixture IDs and fixed dates; mock randomness only when asserting generated ID behavior.
- Stub ResizeObserver, focus, storage, or geometry explicitly for the test that needs
  them. Do not install silent no-op browser mocks globally: these can hide leaks.
- Reset module-owned shared state explicitly. The viewport helper updates the shared
  viewport; each viewport-sensitive test must set its own size.
- Close any manually created effect scopes, listeners, observers or connections.
  Remove DOM nodes created outside test-utils and unmount before restoring mocks.
- Do not globally reset mock implementations; configure each scenario's dependency
  responses explicitly without destroying shared module factories.

## Suite boundaries and completion criteria

### Helper and hook expansion

The helper/hook pass adds focused scenarios for every inventoried helper and hook
file. Direct imports still do not establish exhaustive branch coverage; the
inventory is a discovery map, not a percentage guarantee.

| Evidence                                                                                                                       | Scenarios                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/helpers/core.spec.ts`, `object.spec.ts`, `request.spec.ts`, `time-zone.spec.ts`, `json-viewer.spec.ts`, `date.spec.ts` | Missing/falsy/malformed values, permissions, ID equality, immutable inputs, key validation/reuse, failed serialization, leap dates, birthdays, offsets, cycles and escaped HTML                                                 |
| `shared/hooks/timing-storage.spec.ts`, `presentation.spec.ts`, `lifecycle.spec.ts`                                             | Reactive values/locales, stale search cancellation, storage corruption/denial/quota failures, URL defaults/navigation rejection, calendar formatting, timer cancellation, field feedback prevention, listener and title cleanup |
| `shared/hooks/overlays.spec.ts`, `useFloatingOverlay.spec.ts`                                                                  | Denied access, overlay ownership, rejected submission/close operations, collision settings and ancestor-listener cleanup                                                                                                        |
| `library/components/inputs/hooks/*.spec.ts`                                                                                    | Phone parsing/truncation/paste, select keyboard wrapping, empty/disabled states, outside dismissal, queued pointer cancellation and opening/unmount races                                                                       |
| `app/hooks/actions.spec.ts`, `views/profile/hooks/profile-data.spec.ts`                                                        | Authentication/MFA/account mutation failures, reset authorization cancellation, contact fallbacks, reactive projections and remaining action wrappers                                                                           |
| Existing session and audit-detail suites                                                                                       | Concurrent protected requests, unchanged retry payloads/keys, missing refreshed tokens, network failure, stale rejected responses and unmount while awaiting credentials                                                        |

Regression tests found and corrected undefined-key/ID comparisons, duplicate and
stale search emissions, invalid-date rollover/invalid age calculations, Date
payloads reusing the wrong idempotency key, initially open dismissable layers not
listening, layout load-listener leaks/font rejection handling, malformed validation
message arrays, select disabled/open-unmount behavior, and unhandled rejected
pagination callbacks.

Storage exceptions deliberately remain visible to callers; tests document that
contract rather than silently discarding storage corruption. Shared clock tests
use explicit instants. Browser layout, focus geometry, themes, and complete real
backend flows remain separate evidence. Broader component-library assertions and
measured coverage and regression floors are now tracked in [Coverage](coverage.md);
stronger critical-module thresholds are the next stage.

Keep isolated specs beside production sources. Support helper regression tests
live with the support helpers. Feature integration specs should assert the behavior
of collaborating real layers while replacing only the external API boundary.
Maintain existing E2E coverage and add browser cases where isolated tests cannot
verify geometry, focus, themes or real interaction. Authenticated live backend
tests still require disposable infrastructure and accounts.

Stage 1 is complete when the map is reproducible, the behavior backlog is explicit,
shared helpers work in real suites, and the existing suite still passes under the
cleanup conventions. Subsequent stages add focused behavior coverage, establish
measured coverage baselines and enforce regression floors before raising targets.
