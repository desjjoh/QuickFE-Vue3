# Template completion backlog

[Back to README](../README.md)

QuickAPI-NestJS is the frontend integration target. QuickAPI-NestJS, Express, and FastAPI set the maturity benchmark for disposable integration tests, production artifact checks, release evidence, rollback, and operator documentation.

The existing foundation includes typed adapters, session and account isolation, route loading, shared UI, coverage gates, fixture-based Chromium and accessibility tests, and runtime image exposure checks. Keep these checks in place as the template gains end-to-end coverage. See [Verification](archive/VERIFICATION.md) for recorded runs.

## 1. Establish the baseline and first release scope

- [ ] Run `npm run check`, fixture Chromium, and runtime image verification. Record the source SHA and results, and check the GitHub `Check` result for that same SHA.
- [ ] Fix `lint:fix` so it uses the installed lint tooling. Reconcile the testing and deployment guides with current scripts and workflows.
- [ ] Confirm the first release surface. Proposed scope: home, authentication, profile/account/session settings, and user and audit administration. Keep the component playground discoverable as a reference. Hide unfinished news, videos, forums, shop, and starter links from app navigation unless they get a defined use case for this release.
- [ ] Define the supported browser and locale matrix and the required actions for each shipped route. Decide which administration exports and bulk actions are in scope after checking the API contracts and permission model.

## 2. Qualify accounts against disposable QuickAPI-NestJS

- [ ] Pin a compatible backend revision and provide a repeatable startup and teardown command. Seed reference data and accounts with distinct member and administration permissions. Provide test-only email/OTP capture and isolated object storage.
- [ ] Add a live Chromium test for sign-in/MFA, authenticated navigation, refresh after reload, and logout using real TLS, credentialed CORS, CSRF, and refresh cookies.
- [ ] Extend the live suite to registration, password reset, email/password changes, avatar upload, session revocation and expiry, and cross-tab logout/account switching. Include forbidden direct navigation and stale responses when identity or permissions change.
- [ ] Run these journeys in a dedicated CI job once the harness is deterministic. Retain test reports and failure diagnostics with the frontend and backend revisions. Keep destructive mutations inside disposable environments.

## 3. Finish the administration workflows

- [ ] Complete approved user administration actions and filters, and decide the final behavior for the audit search/export and dashboard. Remove unused controls from shipped views.
- [ ] Prove representative user administration mutations against NestJS. Include a permission denial, a stale-version conflict, and a supported idempotent replay. Verify that resulting account state and audit activity match the action.

## 4. Qualify the shipped product

- [ ] Review each shipped journey for loading, empty, validation, expired-session, forbidden, and recoverable error states. Verify back navigation, deep links, form cancellation, and cache invalidation after mutations.
- [ ] Run keyboard/focus and axe checks for shipped screens and dialogs. Review translations, mobile layouts, and both themes. Run critical journeys on Firefox and WebKit if they are in the supported matrix, with particular attention to cookies, overlays, and uploads.
- [ ] Extend existing regression checks where the new workflows expose ownership, permission, or retry gaps. Evaluate shared DTO cleanup and persistent uncertain-action retries against concrete use cases.

## 5. Qualify an immutable release and rollback

- [ ] Define one supported static-serving topology, including TLS ownership, API origin configuration, credentialed browser access, history fallback, and cache behavior for HTML and hashed assets. Build the release image without packaged local certificates.
- [ ] Build the release candidate once. Run the production dependency audit, browser bundle exposure and image checks, OS/nginx vulnerability scan, and production browser smoke against the candidate. Retain version, source SHA, digest, smoke results, scan results, SBOM, and provenance.
- [ ] Add a dry-run release workflow and rehearse deploying a retained previous digest in disposable infrastructure. Verify deep links, asset loading during rollback, and an authenticated browser journey against a compatible backend. Publish the verified digest when a registry is selected.
- [ ] Document setup, configuration, smoke, release, and rollback procedures. Add basic client error reporting with sensitive fields excluded and enough release information to correlate failures. When hosting is selected, qualify actual ingress, TLS, CORS/cookies, monitoring, and rollback in staging.

The template is ready for release when the approved routes have working user journeys, the required CI and authenticated integration checks pass for the release SHA, and a verified production candidate can be deployed and rolled back by digest. Record hosted qualification when it has been exercised in the chosen environment.
