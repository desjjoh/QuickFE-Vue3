# Architecture

[Back to README](../README.md)

## Repository boundaries

```text
src/
  app/       Application shell, navigation, auth forms, and actions
  config/    Environment defaults and permission definitions
  library/   Reusable UI components, DTOs, SCSS tokens, and demo data
  router/    Route modules and route-access rendering
  shared/    API adapters, stores, composables, helpers, layouts, and forms
  views/     Feature pages, widgets, stores, and form actions
  App.vue    Root route loading/error presentation
  main.ts    Application bootstrap
```

Put generic UI in `library/components`, API-facing models in `library/models`, shared infrastructure in `shared`, and feature-specific behavior in its `views` area. The `@` alias resolves to `src`. Extend existing components and playground examples when a feature needs shared behavior.

## Runtime flow

[main.ts](../src/main.ts) installs Pinia, Router, and i18n; initializes session recovery, viewport state, theme, locale, and authentication; then mounts the app on the window load event.

[App.vue](../src/App.vue) renders the route wrapper with loading/error views and page progress. [The router](../src/router/index.ts) places feature route modules beneath [AppFrame.vue](../src/app/AppFrame.vue). The frame supplies responsive navigation, an application scroll container, route-access presentation, and global toast/modal/offcanvas hosts. The root route owns the shared reference library.

Route metadata describes titles, content keys, authentication, roles, permissions, and scroll behavior. Routes that need initial data declare a `dataLoader` with store-backed load, cleanup, and error callbacks. The global router `beforeResolve` prepares entering datasets before the page swap; successful `afterEach` releases exited owners. Aborted navigation retains the current page data, query-only changes stay with the mounted table hooks, and shared parent loaders survive child navigation. `RouteAccessGuard` keeps its unauthorized/forbidden presentation during sign-in or permission recovery until that same preparation succeeds; protected pages do not mount early. Failed loads use the existing retryable error view. Preparation is scoped to the account and full route URL, shares in-flight requests, and invalidates pending work after successful navigation away, logout, account changes, or access loss. Existing table hooks retain query-only reload ownership after a page is revealed. Feature stores must still check authentication/permissions and reject stale responses. These client checks are UI behavior; the backend remains the authorization authority.

## State and API boundaries

Pinia stores manage authentication, reference data, theme/locale, overlays, sessions, and feature collections. All new data fetching must go through a data store: store actions call API adapters, while stores own fetched data, request errors, stale-response protection, and cleanup. Components and composables trigger or await store actions and present their state; local component state is for presentation and editable form drafts, rather than elaborate fetching workflows or duplicated fetched datasets. API adapters hydrate results into DTOs. UI table state lives in route queries; helpers restrict those values to supported API filters.

Every route dataset declares store-backed `load`, `clear`, and `error` callbacks in route metadata. The router owns initial loading and exit cleanup; pages must not clear datasets in unmount hooks. Store clear actions invalidate pending responses before resetting data. Public reference data belongs to the root route and survives account changes; authentication, preferences, and retained asset caches have application/session lifetimes. Modal detail data is owned by the modal and clears on close. For initial modal loading, register cleanup before awaiting a store action at the top level of setup so the existing modal Suspense fallback handles loading.

Authentication boundaries also clear private state independently of page cleanup. `clearAccountData()` clears both profile activity datasets, sessions, administration users/activity/detail, route preparation, overlays and toast context on logout or account replacement, including cross-tab changes. Add every new account-scoped store to this cleanup boundary. Public reference data, assets, theme and locale remain available. A session UUID coordinated across tabs changes at account boundaries; protected requests retain it so late responses from an earlier session are rejected before reaching callers, including logout followed by sign-in to the same account. Ordinary same-account token refresh preserves this identity and loaded data.

Account mutations capture `createSessionScope(authStore)` when their form or confirmation opens. Pass that scope to `handleModalSubmit` and call `assertCurrent()` after credential waits and network responses, before dispatching or committing state. Carry the same scope through follow-up account dialogs. Logout, account replacement, and same-account re-login invalidate old actions; ordinary token refresh keeps them valid. Session cancellation must not close a newer modal, show stale errors, or purge replacement credentials. The request interceptor captures ownership synchronously at dispatch, preserves existing ownership on retries, and rejects obsolete requests and responses.

Authentication forms use `createAuthWorkflow` for each modal stage. Each stage belongs to its opening session and a unique modal instance; cancellation, replacement, or a completed transition invalidates its callbacks. Check ownership after CSRF and API waits before authenticating, purging, opening another dialog, or showing a toast. Explicit sign-in and registration use `authenticate(response, { newSession: true })`, including same-account sign-in; refresh preserves the current identity. Password-reset authorization belongs only to its current form stage.

Pending CSRF, refresh, and initialization work belongs to its originating auth store/session. Only the owning operation can clear its promise or release its refresh lock. Tabs share non-secret session identity metadata in `quickfe_auth_identity`; credential broadcasts must match that identity, and refresh completion must match the lock owner and operation UUID. Session changes cancel cross-tab waiters and remove their listeners/timers. These checks protect JavaScript state; verification of real refresh-cookie ordering still requires backend/browser integration.

Private data loaders also capture a session scope before obtaining credentials, and check it before storing success or failure results. Keep request UUID checks alongside session checks: UUIDs reject overlapping or cleared loads, while session scopes reject account changes and same-account re-login independently of global cleanup. Administration reads additionally recheck permissions. Route preparation keys and access recovery include the session UUID. Public reference and asset caches remain application-owned and are not bound to an account session.

Unauthorized recovery compares the rejected request's bearer token with the current valid token before refreshing. A delayed `401` reuses already-rotated credentials from the same session; rejection of the current or expired token still triggers refresh. Each original request is replayed at most once, preserving its payload, expected version, and idempotency key. Cross-tab refresh timeouts, unavailable channels, and other lock-coordination failures are retryable coordination errors; they do not prove invalid authentication and must not purge the waiting session. A rejected own refresh still clears authentication.

Browser storage is optional persistence. `useLocalStorageUtil` treats corrupt JSON, invalid values, and denied reads as cache misses; removals and writes tolerate browser policy/quota failures without logging. Writes report success so session coordination can distinguish failed persistence. Theme and locale use allowlists; auth expiry and coordination records validate their shapes. Serialization errors still surface as programmer errors. An authenticated tab retains its in-memory session when persistence fails, and later shared identity changes still invalidate it when readable. Persistence across reloads and cross-tab refresh coordination require working shared storage.

The API facade exposes `security`, `authentication`, `public`, `account`, `sessions`, `administration`, and `articles`. Constructor-based user, audit, and article DTOs distinguish JSON timestamp strings from hydrated `Date` values and create nested DTO instances. Keep display-only audit actors and article authors separate from authenticated users. See [API contracts](api-contracts.md).

## Current feature status

| Area                       | Current state                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Home                       | Top Stories and Must Watch demo composition; static content and placeholder links        |
| News, videos, forums, shop | Placeholder views/routes                                                                 |
| Profile and settings       | Profile quick feed and activity table, profile/account forms, and session management     |
| Administration             | User listing and platform audit activity; some controls remain placeholders              |
| Articles                   | All current public/authoring/admin API adapters and DTOs; product UI remains to be built |
| Playground/template        | Component examples and retained starter pages                                            |

API completeness does not mean every backend capability has a finished screen. Track remaining UI and verification work in [Backlog](backlog.md).
