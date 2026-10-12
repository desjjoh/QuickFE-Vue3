# Testing

[Back to README](../README.md)

## Test layers

| Layer                  | Command                 | Requirements and scope                                                         |
| ---------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| Isolated Vitest        | `npm run test:unit`     | DTO/model, adapter, retry, query, store, and form-action contracts; no backend |
| Browser smoke          | `npm run test:e2e`      | Matching Playwright browser runtimes; fixture reference data by default        |
| Local API verification | `npm run test:api:live` | Running QuickAPI on localhost; read-only routes/schema checks                  |

[VERIFICATION.md](VERIFICATION.md) contains the dated verification record, exact commands, integration fixes, and remaining coverage. Test counts in that record describe a specific run rather than a coverage guarantee.

## Standard checks

```powershell
npm run lint
npm run type-check
npm run test:unit
npm run build
node node_modules/@playwright/test/cli.js install chromium --only-shell
node node_modules/@playwright/test/cli.js test --project=chromium
```

The default Playwright configuration includes Chromium, Firefox, and WebKit. Install all matching browser runtimes before using `npm run test:e2e` to run every project. Chromium is the currently verified CI smoke project.

Browser tests check public shell rendering, the sign-in form's accessible inputs, and guest rejection for session settings. Port 5173 and local certificates are handled consistently with Vite. CI starts the built preview over HTTP; local runs reuse the development server when available.

## Opt-in live checks

```powershell
npm run test:api:live

# Override if your local backend uses a different origin/scheme.
$env:QUICKAPI_LIVE_BASE_URL = 'http://localhost:4000/api/v1'
npm run test:api:live
```

The live suite runs separately in a Node Vitest environment and is excluded from `test:unit`. Targets are restricted to localhost/loopback. It expects enabled Swagger at `/docs-json` and checks health/readiness, references, CSRF, public articles, access protection, and route/schema alignment. Local TLS verification is relaxed only for the suite's dedicated HTTPS agent.

To use real backend reference data in browser smoke tests:

```powershell
$env:QUICKAPI_E2E_LIVE = '1'
node node_modules/@playwright/test/cli.js test --project=chromium
Remove-Item Env:QUICKAPI_E2E_LIVE
```

These checks do not authenticate or mutate accounts. Public detail execution depends on published article data. Successful OTP/MFA, refresh cookies, administration conflicts/replay, account mutations, and complete article lifecycle verification need dedicated disposable fixtures.

## CI and environment limits

[CI](../.github/workflows/ci.yml) runs on pushes and pull requests targeting `main`/`dev`: ESLint, type-check, isolated tests, production build, and fixture-based Chromium smoke tests. Live API checks are not part of CI because they depend on a local backend.

In the Codex Windows sandbox, Vite realpath/socket access on a mapped drive may fail with `EPERM`; the verification runs used approved execution outside that sandbox. A suite that never loaded its tests is not a passing run. Browser failures caused by missing runtimes require installing the version matching the locked Playwright dependency.
