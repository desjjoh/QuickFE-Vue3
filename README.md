# QuickFE-Vue3

A modular Vue 3 frontend template designed for rapid application development, reusable UI composition, and dashboard-style product experiences.
Implements consistent architecture patterns from the QuickFE family — emphasizing TypeScript-first components, route-driven layouts, shared design primitives, authentication-ready flows, and a playground for validating interface behavior.

---

## Features

- **Vue 3 + TypeScript + Vite** application foundation with modern ESM tooling
- **Vue Router** route modules with app-shell layout composition and route metadata
- **Pinia stores** for authentication, modal, offcanvas, and toast state management
- **vue-i18n localization** with locale persistence and language-switching UI
- **Axios API wrapper** for CSRF, authentication, refresh, sign-in, sign-out, and registration flows
- **Reusable shared component library** for buttons, cards, inputs, tabs, dropdowns, typography, overlays, badges, avatars, and layout helpers
- **Playground workspace** for manually validating shared components and interaction patterns
- **Dashboard feature area** with overview, client management, metrics, alerts, recommendations, and timeline widgets
- **SCSS token system** for palette, typography, spacing, borders, effects, mixins, functions, keyframes, and base resets
- **Suspense + error-boundary route rendering** for async view loading and fallback UI
- **Vitest + Playwright tooling** for unit/component-style tests and end-to-end browser tests
- **Strict lint/type-check scripts** using oxlint, ESLint, vue-tsc, and TypeScript

---

## Folder Structure

```bash
src/
 ├── api/                              # Axios instance and backend route adapters
 │   └── routes/                       # API modules for app and authentication endpoints
 ├── helpers/                          # Small utilities shared across modules
 ├── i18n/                             # vue-i18n setup, locale registry, and locale messages
 ├── models/                           # DTO/model classes for tokens, users, and base models
 ├── router/                           # Vue Router setup, route modules, shell layouts, and app frame
 │   ├── components/                   # Router wrappers, fallback rendering, unauthorized screens
 │   ├── layouts/                      # Page-level layout primitives
 │   ├── routes/                       # Feature route definitions
 │   └── views/                        # App shell and settings route views
 ├── shared/                           # Cross-feature UI, forms, hooks, layouts, and component types
 │   ├── components/                   # Reusable UI primitives and interaction components
 │   ├── forms/                        # Shared form/dialog implementations
 │   ├── hooks/                        # Composables for forms, viewport, storage, debounce, search
 │   ├── layouts/                      # Shared form/layout building blocks
 │   └── types/                        # Shared prop and form type definitions
 ├── stores/                           # Pinia stores for auth, modal, offcanvas, and toasts
 ├── styles/                           # Global SCSS imports, resets, functions, mixins, and tokens
 ├── views/                            # Feature views: dashboard, playground, and template pages
 ├── App.vue                           # Root app component and router loading fallback
 └── main.ts                           # Application bootstrap and plugin installation
```

---

## Application Flow

The runtime path is intentionally small and predictable:

```bash
src/main.ts
 ├── imports global SCSS
 ├── creates the Vue application
 ├── installs Pinia, Vue Router, and i18n
 ├── initializes viewport globals
 └── mounts App.vue

src/App.vue
 └── renders RouterComponent with loading fallback

src/router/index.ts
 └── mounts all route modules inside AppFrame.vue

src/router/views/app/AppFrame.vue
 ├── renders the masthead/navigation
 ├── evaluates auth and route-meta guards
 ├── renders route content through RouterComponent
 └── hosts global Toast, Modal, and Offcanvas portals
```

Route metadata controls cross-cutting page behavior such as authentication requirements, content remount keys, and scroll-to-top handling.

---

## Feature Areas

### Dashboard

The dashboard area contains product-style pages and widgets:

- Overview metrics and alert cards
- Recommendation items
- Activity timeline
- Client management and client detail flows
- Shared dashboard section/card widgets

### Playground

The playground is the fastest feedback loop for UI development. It showcases shared primitives such as:

- Buttons and icon buttons
- Badges and avatars
- Cards and typography
- Forms, checkboxes, selects, text fields, and text areas
- Dropdowns, tabs, tooltips, modals, offcanvas panels, and toasts

When adding or changing a shared component, add or update a playground example so the behavior can be reviewed visually.

### Template

The template area keeps the original Vue/Vite starter-style pages available for reference and quick framework smoke testing.

---

## Authentication & API Integration

The frontend is currently wired for a local backend API through the Axios instance in `src/api/useLocalhostAPI.ts`.

Current backend assumptions:

```bash
API base URL: https://localhost:4000/
CSRF route:   GET  /csrf
Refresh:      GET  /api/v1/authentication/refresh
Sign in:      POST /api/v1/authentication/sign-in
Sign out:     POST /api/v1/authentication/sign-out
Register:     PUT  /authentication/register
```

The auth store manages:

- CSRF token retrieval and caching
- Access token refresh/verification
- Authenticated user state
- Refresh-expiry persistence through local storage
- Role and permission checks for route access

> Production note: the API base URL is currently hardcoded for local development and should be moved to environment-driven configuration before deployment.

---

## Testing Structure

Vitest and Playwright are configured with support for:

- Vue single-file components
- TypeScript
- Alias resolution through Vite config
- jsdom unit-test environment
- Browser-based E2E testing across Chromium, Firefox, and WebKit projects

```bash
e2e/
 └── vue.spec.ts                       # Playwright smoke/E2E tests

vitest.config.ts                       # Vitest + Vite merged test configuration
playwright.config.ts                   # Playwright projects and dev-server configuration
```

---

## Local Development Setup

Install dependencies:

```bash
npm install
```

Run the Vite dev server:

```bash
npm run dev
```

Preview a production build locally:

```bash
npm run build
npm run preview
```

The Vite dev server is configured for HTTPS on port `5173` using local certificates from:

```bash
certs/localhost-key.pem
certs/localhost.pem
```

Make sure those files exist locally before starting the dev server.

---

## Environment & Backend Notes

The current project does not require a checked-in `.env` file for the frontend build.
Local backend integration expects the QuickAPI backend to be available at:

```bash
https://localhost:4000/
```

Before production deployment, add environment-based frontend configuration for:

```bash
VITE_API_BASE_URL=https://your-api-host.example.com/
```

Then update the Axios instance to read from `import.meta.env.VITE_API_BASE_URL` instead of the hardcoded local URL.

---

## Docker Workflow

### 1 Build and run the production image

Build the image locally (with an API base URL baked into the Vite build):

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://backend:4000 \
  -t quickfe-vue3:latest .
```

Run the container with Nginx serving the built `dist/` bundle:

```bash
docker run --rm -p 8080:80 quickfe-vue3:latest
```

App URL:

```bash
http://localhost:8080
```

### 2 Docker Compose (production profile)

`compose.yaml` includes a `frontend` service that builds from the local `Dockerfile`, maps host port `8080`, and joins the shared `quickfe-app-net` network.

Start production-style frontend service:

```bash
docker compose --profile prod up --build frontend
```

Stop it:

```bash
docker compose --profile prod down
```

### 3 Docker Compose (development profile)

`compose.yaml` also includes `frontend-dev`, which runs Vite inside a Node container with a bind mount for live editing.

Start dev frontend:

```bash
docker compose --profile dev up frontend-dev
```

App URL:

```bash
http://localhost:5173
```

### 4 Backend-linked local workflow (NestJS by service name)

The compose setup assumes your NestJS backend is reachable on the same Docker network as service name `backend`, on port `4000`.

For frontend-only compose runs, override API URL via shell env:

```bash
VITE_API_BASE_URL=http://backend:4000 docker compose --profile prod up --build frontend
```

If your backend compose stack is separate, connect both stacks to the same external network name (`quickfe-app-net`) so the frontend can resolve `http://backend:4000` by container DNS.

Example backend service snippet:

```yaml
services:
  backend:
    container_name: backend
    # ...
    networks:
      - quickfe-app-net

networks:
  quickfe-app-net:
    external: true
```

---

## Development Scripts

| Script               | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the Vite development server                    |
| `npm run build`      | Run type-checking and build the production bundle    |
| `npm run preview`    | Preview the built application locally                |
| `npm run test:unit`  | Run Vitest unit/component tests                      |
| `npm run test:e2e`   | Run Playwright end-to-end tests                      |
| `npm run build-only` | Build the Vite bundle without the type-check wrapper |
| `npm run type-check` | Run vue-tsc project type-checking                    |
| `npm run lint`       | Run oxlint and ESLint on the project                 |
| `npm run lint:fix`   | Automatically fix linting issues where possible      |
| `npm run format`     | Format source files with Prettier                    |

---

## Production Readiness

QuickFE-Vue3 has a strong frontend foundation, but should be treated as **pre-production** until the following are completed:

- Move API host and feature toggles to environment configuration
- Add CI gates for linting, type-checking, unit tests, and E2E smoke tests
- Expand automated coverage for auth, route guards, forms, and global overlays
- Add production observability for frontend errors and important auth failures
- Validate the full browser/backend security posture, including CSRF, CORS, cookies, and token expiry behavior
- Define deployment, rollback, and smoke-test procedures

---

## Additional Documentation

A newcomer-focused architecture and onboarding guide is available at:

```bash
docs/NEWCOMER_GUIDE.md
```

Start there if you want a guided reading path through the app shell, routing, feature organization, shared UI system, and production-readiness milestones.

---

## License

MIT License — free for personal and commercial use.

---

QuickFE-Vue3 — part of the **QuickFE** template ecosystem by **John Desjardins**.
