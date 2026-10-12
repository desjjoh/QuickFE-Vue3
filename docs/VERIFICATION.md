# Frontend / QuickAPI verification

Verified on October 12, 2026: lint, type-check/production build, 81 isolated tests, 25 live read-only checks, and 3 Chromium smoke tests in both fixture and live-reference modes passed. The local backend currently has zero published articles, so live article detail was not exercised.

## Commands

- `npm run lint`
- `npm run type-check`
- `npm run test:unit` — isolated model, adapter, authentication-recovery, query, store, and form-action tests. Does not contact QuickAPI.
- `npm run build`
- `npm run test:e2e` — browser smoke tests; reference responses are fixtures by default. Run a single browser with `node node_modules/@playwright/test/cli.js test --project=chromium`.
- `npm run test:api:live` — opt-in read-only checks against `https://localhost:4000/api/v1`. Override with `QUICKAPI_LIVE_BASE_URL`; the suite restricts the target to localhost/loopback.

Install the matching browser runtime with `node node_modules/@playwright/test/cli.js install chromium --only-shell`. Playwright uses port 5173 and recognizes local HTTPS certificates for both browser navigation and server readiness. CI uses the production preview over HTTP and runs Chromium smoke tests after the build.

To run browser smoke tests with actual localhost reference data, set `QUICKAPI_E2E_LIVE=1` before running Playwright. These cover the public app shell, opening the sign-in form, and rejecting guest access to session settings without issuing a protected session request. They do not sign in or submit account changes.

## Live coverage and remaining work

The read-only suite checks process health/readiness, public article list/detail when published rows exist, profile-form reference data, CSRF response hydration, unauthenticated access protection, registered article/session endpoints, and version/actor/session fields in the running OpenAPI schema. If the public article collection is empty, list behavior is verified; article detail execution remains pending seeded data.

There is currently no dedicated authenticated test account or email/OTP fixture setup. Successful sign-in, refresh-cookie rotation, registration/OTP/MFA/password reset, account mutations, administration version conflicts/idempotent replay, and the article lifecycle have isolated frontend tests or adapter coverage but are not fully verified end-to-end against authenticated QuickAPI sessions. Finish those checks once a disposable test account and email/storage test fixtures are available. Do not run destructive integration tests against personal accounts or the development database as a substitute.

## Integration corrections

QuickAPI rejects `Content-Type` on bodyless GET/DELETE requests. The shared Axios instance no longer sets a global JSON content type; Axios supplies it for JSON bodies and adapters set it for multipart uploads. Tests enforce this distinction.

Profile avatar/phone/address forms keep failed inputs open and retain an idempotency key for unchanged retries within that open form. Changed DTO content or a newly selected File starts a new action/key. Reopening a form also starts a new action; this is not durable retry storage across reloads. Session actions release their loading state in `finally` and purge local authentication only after a successful revocation response.

Audit UI filters now use administration query mapping rather than an account-query cast, including actor search and bounded page sizes. User tables retain the server's administration version; audit rows use display-only actor user details and current status where available.
