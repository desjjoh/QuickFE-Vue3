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

Route metadata describes titles, content keys, authentication, roles, permissions, and scroll behavior. `RouteAccessGuard` renders unauthorized/forbidden states. Some routes also load data in `beforeEnter`; feature stores must check authentication/permissions before fetching protected data. These client checks are UI behavior; the backend remains the authorization authority.

## State and API boundaries

Pinia stores manage authentication, reference data, theme/locale, overlays, sessions, and feature collections. Views invoke composables/form actions, which call the API facade and hydrate results into DTOs. UI table state lives in route queries; helpers restrict those values to supported API filters.

The API facade exposes `security`, `authentication`, `library`, `account`, `sessions`, `administration`, and `articles`. Constructor-based user, audit, and article DTOs distinguish JSON timestamp strings from hydrated `Date` values and create nested DTO instances. Keep display-only audit actors and article authors separate from authenticated users. See [API contracts](api-contracts.md).

## Current feature status

| Area                       | Current state                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Home                       | Top Stories and Must Watch demo composition; static content and placeholder links        |
| News, videos, forums, shop | Placeholder views/routes                                                                 |
| Profile and settings       | Account activity, profile/account forms, and session management                          |
| Administration             | User listing and platform audit activity; some controls remain placeholders              |
| Articles                   | All current public/authoring/admin API adapters and DTOs; product UI remains to be built |
| Playground/template        | Component examples and retained starter pages                                            |

API completeness does not mean every backend capability has a finished screen. Track remaining UI and verification work in [Backlog](backlog.md).
