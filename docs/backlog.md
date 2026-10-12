# Technical backlog

[Back to README](../README.md)

This lists verified gaps and intentionally deferred work. The API synchronization pass completed user/audit/session model alignment, current article endpoint adapters, supported idempotency, bodyless-request header correction, and isolated/live-read-only/browser checks. Those items should not be presented as unfinished infrastructure.

## Before claiming full backend integration

- Set up disposable authenticated users, role/permission variants, email/OTP capture, and storage fixtures.
- Verify successful registration, sign-in/MFA, password reset, email/password changes, refresh-cookie rotation, expiry/revocation, and multiple-tab behavior against QuickAPI.
- Exercise live administration stale versions, controlled reasons, idempotent replay, and complete article lifecycle actions.
- Seed published articles for live public-detail verification. The October 12 verification backend had no published rows.
- Verify the actual frontend/backend CORS, CSRF, TLS, and cookie topology.

## Product and UI

- Connect homepage content and complete article reading, authoring, and moderation screens using the available adapters.
- Replace placeholder news/videos/forums/shop views and homepage template/nonexistent content links.
- Complete administration action/filter/export controls. Endpoint adapters do not imply these screens exist.
- Audit accessibility, keyboard/focus behavior, responsive layouts, translation coverage, and loading/empty/error presentation across features.

## Architecture and reliability

- Consolidate remaining auth challenge interfaces and view-local API payload classes into shared constructor-based DTOs.
- Review protected route loading/access ordering and nested permission semantics as more feature routes are added.
- Extend store tests for overlapping requests, account switches, sign-out during fetches, and cache invalidation.
- Decide whether uncertain-action retry state needs persistence beyond the currently open form.
- Expand meaningful browser/account tests and coverage enforcement; the current browser suite is smoke coverage, not a complete user-journey suite.

## Tooling and deployment

- Resolve `lint:fix` invoking undeclared oxlint, or simplify the command to installed tooling.
- Configure frontend error reporting and production observability.
- Make Docker API configuration explicit at build time and exclude environment files from the build context.
- Replace local certificate packaging with the intended deployment TLS arrangement.
- Define release, rollback, and production smoke procedures and validate them in staging.

Use [the verification record](VERIFICATION.md) to distinguish completed checks from coverage that remains pending.
