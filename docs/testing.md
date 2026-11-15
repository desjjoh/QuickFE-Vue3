# Testing

[Documentation index](../README.md#documentation)

Run `npm run check` for formatting, lint, types, CI gate tests, the production
dependency audit, unit coverage, and the production build.

| Suite              | Command                 | Scope                                                                   |
| ------------------ | ----------------------- | ----------------------------------------------------------------------- |
| Unit and component | `npm run test:unit`     | Models, adapters, stores, components, and view workflows using fixtures |
| Coverage           | `npm run test:coverage` | V8 coverage and regression checks against the recorded baseline         |
| Browser            | `npm run test:e2e`      | Playwright journeys, keyboard and focus behavior, and axe checks        |
| Live API           | `npm run test:api:live` | Read-only checks against a running local NestJS instance                |

## Browser checks

```sh
npx playwright install chromium --only-shell
npx playwright test --project=chromium
```

By default, the suite uses API fixtures. The configuration also defines Firefox
and WebKit projects, which need their matching runtimes. CI runs Chromium
against the uploaded production build and retains test reports, accessibility
results, and failure traces and screenshots.

## Live API checks

Start NestJS with seeded reference data and Swagger enabled at `/docs-json`.
The live suite defaults to `https://localhost:4000/api/v1`. Set
`QUICKAPI_LIVE_BASE_URL` to override it with another loopback URL. The suite
checks health and readiness, reference data, CSRF, access protection, and
OpenAPI contracts. Set `QUICKAPI_E2E_LIVE=1` to use live reference data in
browser smoke tests. Authenticated mutations still need disposable accounts,
email capture, and storage fixtures.

## CI and coverage

The [CI workflow](../.github/workflows/ci.yml) combines formatting, lint, types,
security audit, unit coverage, build, browser tests, and runtime image checks
in the required aggregate `Check` job. Record hosted runs against the tested
commit SHA.

See the archived [coverage workflow](archive/coverage.md),
[test inventory](archive/test-inventory.md), and
[verification record](archive/VERIFICATION.md) for detailed evidence.
