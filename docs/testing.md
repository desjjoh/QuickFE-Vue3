# Testing

[Back to README](../README.md)

## Test layers

[Test inventory](test-inventory.md) maps source files to existing suite references.
[Testing standards](testing-standards.md) defines priorities, shared support,
deterministic execution, and cleanup conventions for expanding the suite.
[Component/application evidence](component-application-tests.md) records the expanded
behavior and browser checks, regression fixes, and remaining gaps.
[Measured coverage](coverage.md) defines report scope, the observed baseline,
regression gates, and reviewed baseline updates.

Shared test infrastructure lives at the repository root:

```text
test/
├── e2e/       # Playwright browser specs and editor configuration
├── support/   # Fixtures, mounting, clocks, deferred promises and browser mocks
├── setup.ts   # Vitest cleanup defaults
└── tsconfig.json
```

Import shared support with `@test/support/...`. Unit specs remain beside their
production source files.

| Layer                  | Command                 | Requirements and scope                                                         |
| ---------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| Isolated Vitest        | `npm run test:unit`     | DTO/model, adapter, retry, query, store, and form-action contracts; no backend |
| Browser smoke          | `npm run test:e2e`      | Matching Playwright browser runtimes; fixture reference data by default        |
| Local API verification | `npm run test:api:live` | Running QuickAPI on localhost; read-only routes/schema checks                  |

[VERIFICATION.md](VERIFICATION.md) contains the dated verification record, exact commands, integration fixes, and remaining coverage. Test counts in that record describe a specific run rather than a coverage guarantee.

## Standard checks

```powershell
npm run format:check
npm run lint
npm run type-check
npm run test:ci
npm run test:coverage
npm run security:audit
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

Checks are split into independent jobs, following QuickAPI-NestJS's CI structure:

| Check                     | Evidence                                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting                | Prettier checks source, tests, scripts, documentation, workflows, and root configuration; generated font styles are excluded                  |
| Linting                   | ESLint                                                                                                                                        |
| Type checking             | Application, Vitest, tooling, and strict E2E TypeScript projects                                                                              |
| Production security audit | Fresh production-only registry audit; blocks unreviewed high/critical findings, unavailable evidence, and invalid or expired exceptions       |
| Unit tests                | Vitest JUnit and coverage reports; global/module/file baseline gate; CI gate regression tests; missing coverage and empty suites fail         |
| Production build          | Uploaded `dist` artifact and package/chunk exposure report                                                                                    |
| Browser tests (Chromium)  | Tests against that exact build over HTTP using API fixtures; JUnit/HTML results, screenshots, and failure traces are uploaded even on failure |
| Runtime image exposure    | Unpublished Docker build gated by the production audit; nginx configuration, asset hashes, and absence of Node installations checked          |
| Check                     | Required aggregate status; every dependency must succeed, including browser tests                                                             |

The aggregate `Check` job runs with `if: always()` and rejects failed, cancelled, skipped, or missing jobs. Its summary lists each result. Workflows also support manual runs and merge-queue checks. Test reports are retained for 14 days and build artifacts for 7 days.

Run `npm run check` for the local checks excluding browser and Docker execution.
For Docker exposure verification, follow [Deployment](deployment.md).

The production audit requires registry access and follows the
[security and exception policy](dependency-security.md). CI security reports are
retained for 14 days. No exceptions are currently approved.

To reproduce CI browser behavior locally after a build:

```powershell
$env:CI = 'true'
$env:QUICKAPI_E2E_LIVE = '0'
$env:QUICKFE_E2E_PORT = '5175' # Optional: avoid an existing development server.
node node_modules/@playwright/test/cli.js test --project=chromium
Remove-Item Env:CI, Env:QUICKAPI_E2E_LIVE, Env:QUICKFE_E2E_PORT
```

GitHub merge enforcement is configured separately from the workflow. The inspected `Protect main` ruleset requires the exact `Check` status from GitHub Actions and requires pull requests, but administrators can bypass it. No `dev` ruleset was returned; legacy branch-protection settings could not be inspected with the connector's permissions. To protect `dev`, configure a branch ruleset requiring pull requests and `Check` from GitHub Actions. Enable up-to-date checks and restrict administrator bypass if those are desired enforcement requirements. Keep `Check` as the stable required context when adding or renaming individual jobs.

Workflow edits and passing local checks do not establish that the updated workflow has passed on GitHub; verify the run for the committed SHA after pushing.

In the Codex Windows sandbox, Vite realpath/socket access on a mapped drive may fail with `EPERM`; the verification runs used approved execution outside that sandbox. A suite that never loaded its tests is not a passing run. Browser failures caused by missing runtimes require installing the version matching the locked Playwright dependency.
