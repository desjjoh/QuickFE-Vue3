# Starter completion backlog

[Documentation index](../README.md#documentation)

QuickAPI-NestJS is the integration target. The starter should demonstrate a public
entry point, account and session management, permissioned administration, and
reusable components. QuickAPI sibling apps set the benchmark for repeatable
verification and release evidence.

## 1. Build the public shell and pages

- [ ] Build a shared responsive header and footer in the app shell. Use the same
      route definitions for desktop and mobile navigation, with footer links to
      About, Terms of Service, and Privacy Policy. Verify keyboard navigation and
      landmarks in both themes.
- [ ] Build the public home at the root with an introduction and working sign-in
      and registration entry points. Give the playground its own discoverable
      reference link and give unknown routes a dedicated 404 page.
- [ ] Replace the title-only About screen with a public page explaining what the
      starter includes and where to find its component and project references.
- [ ] Build public Terms of Service and Privacy Policy routes with a shared
      content layout. Confirm the deployment's terms, data handling, and contact
      details before publishing the policies. Link the routes from the footer and
      replace the registration form's placeholder links. Verify that guests can
      open both pages without losing registration progress.
- [ ] Decide which remaining More entries belong in the starter. Give each
      retained entry a real destination and remove links for deferred pages.
- [ ] Fix the undeclared oxlint dependency in the lint-fix command. Record local
      checks, fixture Chromium, image verification, and the hosted Check result
      against the same commit where available.

## 2. Prove the account flows against NestJS

- [ ] Pin a compatible backend revision and document a repeatable disposable
      setup. Seed a member and an administrator. Add test email capture and isolated
      object storage as the workflows require them.
- [ ] Make the first browser journey sign-in, reload with cookie-backed refresh,
      and logout. Verify that a guest cannot open a protected route and a signed-in
      member cannot open administration.
- [ ] Extend the live suite to registration, MFA, password reset, account
      changes, avatar upload, session revocation, and cross-tab logout/account
      switching. Verify that retrying a supported profile mutation with the same
      key applies the action once.
- [ ] Add the repeatable live journeys to CI once the disposable harness is
      deterministic. Record both source revisions and retain failure artifacts.

## 3. Finish the administration panels

- [ ] **Overview.** Replace the placeholder dashboard with useful navigation
      and summaries backed by data the signed-in administrator can access.
      Confirm any dedicated metrics contract before adding metrics to the panel.
- [ ] **User management.** Finish filters and user detail, then wire versioned
      status and role updates with confirmation and controlled reasons. Verify
      permission denial, stale-version recovery, idempotent replay, updated list
      and detail state, and the resulting audit entry.
- [ ] **Platform activity.** Finish supported search/filter, sorting, pagination,
      and audit detail. Verify that filter state survives navigation and that
      detail access respects its separate permission.
- [ ] **Additional actions.** Resolve the scope of administrator deletion, user
      and audit exports, and bulk actions against NestJS contracts. Ship working,
      permission-aware controls for approved actions and remove placeholders for
      deferred actions.
- [ ] **Panel navigation.** Check deep links and landing routes for administrators
      with different permissions. Cover loading, empty, forbidden, and retry
      states for each panel.

## 4. Qualify the shipped starter

- [ ] Check loading, empty, validation, forbidden, expired-session, and failure
      states on the shipped routes. Verify cancellation, back navigation, and
      refresh after mutations.
- [ ] Set the supported browser and locale matrix. Verify keyboard and focus
      behavior, axe checks, translations, narrow layouts, and both themes.
- [ ] Build one production candidate with explicit API configuration and
      deployment-owned TLS. Scan and smoke-test that candidate, record its source
      SHA and digest, and rehearse rollback to a retained digest.
- [ ] Document operator setup, smoke, and rollback steps. Qualify real ingress,
      CORS, TLS, cookies, and reporting when a hosted environment is selected.

The starter is complete when all scoped public pages and shared navigation work, account and administration
journeys pass against disposable NestJS, required checks pass for the candidate
commit, and the production artifact passes smoke and rollback rehearsal. Record
hosted qualification separately.
