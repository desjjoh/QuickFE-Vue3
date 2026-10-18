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

[App.vue](../src/App.vue) renders the route wrapper with loading/error views and page progress. [The router](../src/router/index.ts) places feature route modules beneath [AppFrame.vue](../src/app/AppFrame.vue). The frame supplies responsive navigation, an application scroll container, route-access presentation, and global toast/modal/offcanvas hosts. Its initialization loads the shared reference library.

Route metadata describes titles, content keys, authentication, roles, permissions, and scroll behavior. Routes that need initial data declare a `dataLoader` with store-backed load, cleanup, and error callbacks. Their `beforeEnter` calls shared route preparation, preserving loading before the page swap. `RouteAccessGuard` keeps its unauthorized/forbidden presentation during sign-in or permission recovery until that same preparation succeeds; protected pages do not mount early. Failed loads use the existing retryable error view. Preparation is scoped to the account and full route URL, shares in-flight requests, and invalidates pending work after successful navigation away, logout, account changes, or access loss. Existing table hooks retain query-only reload ownership after a page is revealed. Feature stores must still check authentication/permissions and reject stale responses. These client checks are UI behavior; the backend remains the authorization authority.

## State and API boundaries

Pinia stores manage authentication, reference data, theme/locale, overlays, sessions, and feature collections. All new data fetching must go through a data store: store actions call API adapters, while stores own fetched data, request errors, stale-response protection, and cleanup. Components and composables trigger or await store actions and present their state; local component state is for presentation and editable form drafts, rather than elaborate fetching workflows or duplicated fetched datasets. API adapters hydrate results into DTOs. UI table state lives in route queries; helpers restrict those values to supported API filters.

Clear page- and modal-specific fetched data when the owning page unmounts or modal closes, and invalidate pending responses to prevent stale data from returning. For initial modal loading, register cleanup before awaiting a store action at the top level of setup so the existing modal Suspense fallback handles loading.

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
