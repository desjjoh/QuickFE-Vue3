# QuickFE-Vue3

A Vue 3 and TypeScript frontend for **QuickAPI-NestJS**, with shared UI components, account security flows, administration views, and article API integration.

The application foundation includes versioned administration/article contracts, request idempotency, nested DTO hydration, and automated frontend checks. Public content pages are still being developed; complete authenticated integration verification needs disposable accounts and email/storage fixtures.

## What's included

- Vue 3, TypeScript, Vite, Vue Router, Pinia, SCSS, and vue-i18n.
- Shared UI primitives, forms, overlays, design tokens, and a component playground.
- Registration/OTP, sign-in/MFA, password reset, account/profile settings, and session management.
- User administration and audit activity views with typed API models.
- Public, authoring, and administration article adapters, including multipart heroes, lifecycle actions, versions, and supported idempotency keys.
- Vitest model/adapter/store/form tests, opt-in local API checks, Playwright smoke tests, and CI for `main` and `dev`.

## Getting started

Use Node.js 22.12 or newer and npm. The complete supported Node range is in [package.json](package.json).

1. Install dependencies: `npm ci`.
2. Copy [.env.example](.env.example) to a gitignored `.env` and set `VITE_API_BASE_URL` to your QuickAPI instance, including `/api/v1`.
3. Start QuickAPI-NestJS using its development guide, with reference data seeded and browser CORS/cookies configured for the frontend origin.
4. Run `npm run dev`.

The frontend uses port **5173**. It serves HTTPS when both local certificate files are present, otherwise HTTP. The API fallback is `https://localhost:4000/api/v1`; change it if your backend uses HTTP. See [Development](docs/development.md) for setup and certificate details.

## Documentation

| Guide                                           | Contents                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| [Development](docs/development.md)              | Local setup, environment, certificates, scripts, and fonts                   |
| [Architecture](docs/architecture.md)            | Folder boundaries, bootstrap, routing, state, and feature status             |
| [API contracts](docs/api-contracts.md)          | Backend routes, DTO conventions, versions, idempotency, and article adapters |
| [Testing](docs/testing.md)                      | Isolated/live/browser suites, CI, commands, and verification limits          |
| [Deployment and operations](docs/deployment.md) | Static builds, Docker/nginx, build-time configuration, and diagnostics       |
| [Technical backlog](docs/backlog.md)            | Remaining integration, product, testing, and deployment work                 |

Detailed references: [adapter/retry contracts](docs/API_ADAPTERS.md), [article endpoints](docs/ARTICLE_API.md), [diagnostics inventory](docs/DIAGNOSTICS_INVENTORY.md), and [verification record](docs/VERIFICATION.md).

Configuration defaults live in [src/config/env.ts](src/config/env.ts), scripts in [package.json](package.json), and CI checks in [.github/workflows/ci.yml](.github/workflows/ci.yml).

## API overview

| Audience                                         | Backend route             |
| ------------------------------------------------ | ------------------------- |
| Public articles                                  | `/api/v1/public/articles` |
| My articles                                      | `/api/v1/articles`        |
| Administration users/audits/articles             | `/api/v1/administration`  |
| Authentication, registration, and password reset | `/api/v1/authentication`  |
| Current account/profile/sessions                 | `/api/v1/account`         |
| CSRF                                             | `/api/v1/security/csrf`   |
| Reference data                                   | `/api/v1/public/library`  |

Article API coverage is complete for the current backend controllers; article feature screens are not yet connected. See [API contracts](docs/api-contracts.md) before adding mutations or retry behavior.

## Quality checks

```sh
npm run lint
npm run type-check
npm run test:unit
npm run build
```

Browser and local backend verification have separate setup requirements. Follow [Testing](docs/testing.md). Passing checks do not establish full authenticated or production readiness.

## License

[MIT](LICENSE).
