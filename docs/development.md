# Development

[Back to README](../README.md)

## Local configuration

Use Node.js 22.12 or newer and npm; CI uses Node 22. Install the locked dependencies with `npm ci`. The engine range in [package.json](../package.json) also supports Node 20.19.

PowerShell setup:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Set the API URL in `.env`:

```dotenv
VITE_API_BASE_URL=https://localhost:4000/api/v1
```

[env.ts](../src/config/env.ts) trims whitespace and the final slash and falls back to the URL above when the value is absent or blank. This is Vite build-time configuration and is visible to browser users. Do not put server secrets or operations credentials in `VITE_*` variables. Restart Vite after changing local environment files.

The backend is QuickAPI-NestJS. Follow its README/development guide to start its database, Redis, application, and required services and seed reference data. Align frontend/backend schemes, trust local certificates, and configure backend CORS for the exact frontend origin and credentialed requests. If QuickAPI runs over HTTP, set `VITE_API_BASE_URL=http://localhost:4000/api/v1` and use a compatible local frontend setup.

## Ports and HTTPS

[Vite](../vite.config.ts) uses strict port **5173** for development and preview. Development enables HTTPS only when both files exist:

- `certs/localhost-key.pem`
- `certs/localhost.pem`

Without those files, development uses HTTP. `npm run preview` serves the built bundle over HTTP on the same port. The dev server and preview cannot occupy that port simultaneously. Certificate files are gitignored.

The app initializes authentication before mounting and loads reference data through the shell. Normal local development requires a reachable backend; fixture browser tests provide their own reference responses.

## Commands

| Command                  | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `npm run dev`            | Start Vite development                    |
| `npm run build`          | Type-check and build `dist/`              |
| `npm run build-only`     | Build without the type-check wrapper      |
| `npm run preview`        | Serve the built bundle locally            |
| `npm run type-check`     | Run project TypeScript/Vue checks         |
| `npm run lint`           | Run ESLint                                |
| `npm run lint:fix`       | Run oxlint fixes, then ESLint fixes       |
| `npm run format`         | Format source files with Prettier         |
| `npm run fonts:download` | Run the Google Fonts download script      |
| `npm run test:unit`      | Isolated frontend tests                   |
| `npm run test:api:live`  | Opt-in read-only localhost backend checks |
| `npm run test:e2e`       | Playwright browser projects               |

`lint:fix` currently invokes oxlint, which is not declared in this package's dependencies; use it only if that executable is available. Tracking this tooling gap is part of the [backlog](backlog.md).

Font downloads populate assets under `public/fonts` and generated styles in the component library. Inspect [the script](../scripts/download-google-fonts.ts) before changing the configured fonts.

See [Testing](testing.md) for test prerequisites and [Deployment](deployment.md) for Docker commands.
