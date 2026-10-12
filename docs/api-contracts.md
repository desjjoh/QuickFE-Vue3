# API contracts

[Back to README](../README.md)

## Backend and facade

The backend is QuickAPI-NestJS. [useLocalhostAPI.ts](../src/shared/api/useLocalhostAPI.ts) creates the shared Axios instance from `APP_ENV.API_BASE_URL` and exposes domain adapters. The configured base includes `/api/v1`; adapters use relative paths.

| Facade member                      | Coverage                                                             |
| ---------------------------------- | -------------------------------------------------------------------- |
| `security`                         | CSRF acquisition with cookies                                        |
| `authentication`                   | Sign-in/MFA, refresh, sign-out, registration OTP, and password reset |
| `library`                          | Countries, genders, roles, statuses, and timezones                   |
| `account`                          | Email/password/MFA, deletion, activity, and profile mutations        |
| `sessions`                         | List, revoke one, revoke all under `account/sessions`                |
| `administration.users` / `.audits` | Versioned user actions, user activity, and audit search/detail       |
| `articles.public` / `.authoring`   | Public articles and creator operations                               |
| `administration.articles`          | Review collection/detail and publishing lifecycle                    |

The detailed article matrix lives in [ARTICLE_API.md](ARTICLE_API.md). Diagnostics are application-root operations routes and are inventoried in [DIAGNOSTICS_INVENTORY.md](DIAGNOSTICS_INVENTORY.md).

## DTO conventions

Use explicit `*Dto` classes with constructors for API models, alongside wire interfaces/types. Response constructors hydrate nested models and dates, preserving backend nullability. Wire timestamp fields use strings; hydrated timestamps use `Date`. List DTOs retain backend pagination metadata. Request constructors select contract fields rather than forwarding an arbitrary view model.

Administration reads use `UserAdministrationDto`, including `version`; current-account responses use `UserDto`. Article management list/detail models carry a revision; public article projections do not. Audit actors use a compact display DTO with current account status and are distinct from the event subject and from authentication state.

Some existing auth challenge contracts and form payload types still use interfaces or view-local classes. Consolidating these into shared DTO classes is tracked in [Backlog](backlog.md); do not assume every legacy contract has already been migrated.

## Authentication and transport

Authenticated requests use bearer access tokens. Account/security and article mutations pass CSRF where required and send cookies for credentialed requests. Refresh is `POST authentication/refresh`; registration uses `POST authentication/registration/request`, `/resend`, and `/confirm`.

QuickAPI rejects `Content-Type` on bodyless GET/DELETE requests. The Axios instance does not set a global JSON content type: Axios handles JSON bodies, and upload adapters set multipart content type. Hero uploads include accessibility metadata and allow 90 seconds for backend processing.

## Concurrency and retries

Read a record's current `version` and send it as `expected_version` for versioned mutations. Use backend-controlled reason codes for user administration actions and article return/archive/restore actions. Preserve conflicts for caller handling; do not increment revisions or automatically replay stale actions.

Supported endpoints accept `Idempotency-Key`. A new action gets a new key; a retry needs the same payload/file and key. Authentication recovery retries eligible authenticated account/admin/creator requests once after a 401 while retaining the original payload/key. It does not automatically retry network failures, conflicts, or server errors.

[API_ADAPTERS.md](API_ADAPTERS.md) defines the supported operations and caller-owned retry keys. Existing profile avatar/phone/address forms retain keys within an open form and preserve failed input; edited payloads or new file selections start a new action. This state does not survive reopening or reloading the form.

## Contract verification

The source adapters and DTOs are checked with isolated tests, and opt-in localhost checks compare live public data and OpenAPI routes/schema fields. Authenticated end-to-end verification still needs disposable account/email/storage fixtures. See [Testing](testing.md) and [the verification record](VERIFICATION.md).
