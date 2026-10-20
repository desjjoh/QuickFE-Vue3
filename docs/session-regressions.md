# Session regression scenarios

[Testing](testing.md) · [Architecture](architecture.md)

These checks exercise the real frontend stores, interceptor, forms and router against controlled responses. Browser scenarios run against production output and use actual tabs, BroadcastChannel and localStorage. HTTP and account fixtures are mocked; these results are not live QuickAPI authentication verification.

| Scenario                                    | Evidence and assertions                                                                                                                                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Delayed sign-in/sign-out                    | `test/unit/app/hooks/actions.spec.ts` and `test/e2e/auth-workflows.spec.ts`: late success/failure cannot replace a newer account, purge a newer session, close its dialog or display obsolete errors.                                                        |
| Canceled MFA/registration                   | Action tests cover cancellation during CSRF waits, verification and resends. Browser tests cancel pending verification, reopen sign-in, and preserve the new draft after success or failure arrives.                                                         |
| Account replacement during refresh          | Auth lifecycle, real interceptor/store integration and browser tests preserve the new account and reject old credentials. A pending destination may load afresh for the replacement account.                                                                 |
| Same-account re-login                       | A new login rotates session identity; old actions and refreshes are canceled despite an unchanged user ID. Ordinary token refresh preserves identity.                                                                                                        |
| Overlapping generations                     | Lifecycle tests complete the oldest refresh after a newer refresh finishes and a third starts; old cleanup cannot delete the current promise or lock.                                                                                                        |
| Concurrent/staggered unauthorized responses | `test/unit/shared/stores/auth-recovery.spec.ts` exercises the real interceptor and store together: one refresh, unchanged request payload/version/idempotency key, reuse of already-rotated valid tokens and a single replay limit.                          |
| Lost refreshing tab                         | Fake-clock tests verify timeout/listener cleanup and retry. A browser test closes the lock-owning tab, verifies that the other tab remains signed in, and recovers through the existing Reload action after the lock expires.                                |
| Backend refresh rejection                   | Real store/interceptor integration verifies that a rejected own refresh clears authentication, saved expiry and its lock. Coordination errors alone do not establish invalid authentication and must not log out the waiting tab.                            |
| Storage failures                            | `test/e2e/reliability.spec.ts` and storage/preference/auth unit tests cover corrupt JSON, unsupported values, denied getters/operations and exhausted quota. Current-tab authentication remains usable; shared coordination requires working shared storage. |
| Duplicate submissions and transitions       | Action tests suppress duplicate API calls and prevent old close transitions, resends or completion callbacks from manipulating replacement workflows.                                                                                                        |

Use `npm run test:coverage` for isolated tests and the coverage gate. Build with `npm run build-only`, then run `node node_modules/@playwright/test/cli.js test --project=chromium`. The browser fixture data and runtime requirements are documented in [Testing](testing.md).

## Remaining integration boundaries

- Actual refresh-cookie rotation and ordering of delayed Set-Cookie responses need disposable QuickAPI accounts. Ignoring stale JavaScript responses cannot undo a cookie already applied by the browser.
- Server session expiry/revocation, MFA/email delivery, and production CORS/CSRF/TLS topology still require authenticated backend integration.
- Closing a refreshing browser tab is covered; operating-system sleep, suspended background tabs and clock changes remain separate scenarios.
- Cross-tab guarantees require functioning shared storage, BroadcastChannel, and compatible loaded application versions. Blocked-storage tests prove per-tab recovery rather than coordination without shared persistence.
