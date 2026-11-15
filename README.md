# QuickFE-Vue3

A Vue 3 and TypeScript frontend for **QuickAPI-NestJS**, with shared UI components, account security flows and administration views.

The application foundation includes versioned administration contracts, request idempotency, nested DTO hydration, and automated frontend checks. Public content pages are still being developed; complete authenticated integration verification needs disposable accounts and email/storage fixtures.

## What's included

- Vue 3, TypeScript, Vite, Vue Router, Pinia, SCSS, and vue-i18n.
- Shared UI primitives, forms, overlays, design tokens, and a component playground.
- Registration/OTP, sign-in/MFA, password reset, account/profile settings, and session management.
- User administration and audit activity views with typed API models.
- Vitest model/adapter/store/form tests, opt-in local API checks, Playwright smoke tests, and CI for `main` and `dev`.

## Getting started

Use Node.js 22.12 or newer and npm. The complete supported Node range is in [package.json](package.json).

1. Install dependencies: `npm ci`.
2. Copy [.env.example](.env.example) to a gitignored `.env` and set `VITE_API_BASE_URL` to your QuickAPI instance, including `/api/v1`.
3. Start QuickAPI-NestJS using its development guide, with reference data seeded and browser CORS/cookies configured for the frontend origin.
4. Run `npm run dev`.

The frontend uses port **5173**. It serves HTTPS when both local certificate files are present, otherwise HTTP. The API fallback is `https://localhost:4000/api/v1`; change it if your backend uses HTTP. See [Setup](docs/setup.md) for setup and certificate details.

## Documentation

| Guide                                  | Contents                                                    |
| -------------------------------------- | ----------------------------------------------------------- |
| [Setup](docs/setup.md)                 | Installation, local HTTPS, and development commands         |
| [Architecture](docs/architecture.md)   | Routing, state, session ownership, and component boundaries |
| [Configuration](docs/configuration.md) | API URL, build-time settings, and backend origin            |
| [Testing](docs/testing.md)             | Unit, browser, and live API checks                          |
| [Security](docs/security.md)           | Browser credentials, API permissions, and dependency gates  |
| [Deployment](docs/deployment.md)       | Static serving, Docker/nginx, and release verification      |
| [Backlog](docs/backlog.md)             | Remaining product, integration, and release work            |

See [API contracts](docs/api-contracts.md) for the NestJS adapter reference.

## API overview

| Audience                                         | Backend route            |
| ------------------------------------------------ | ------------------------ |
| Administration users and audits                  | `/api/v1/administration` |
| Authentication, registration, and password reset | `/api/v1/authentication` |
| Current account/profile/sessions                 | `/api/v1/account`        |
| CSRF                                             | `/api/v1/security/csrf`  |
| Reference data                                   | `/api/v1/public/library` |

See [API contracts](docs/api-contracts.md) before adding mutations or retry behavior.

## Quality checks

```sh
npm run check
```

Browser and local backend verification have separate setup requirements. Follow [Testing](docs/testing.md). Passing checks do not establish full authenticated or production readiness.

## License

[MIT](LICENSE).
