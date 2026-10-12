# API adapter contracts

The adapter contracts follow the local QuickAPI-NestJS API. Response DTO constructors hydrate JSON timestamps and nested models. Administration user reads return `UserAdministrationDto`; authenticated account responses return `UserDto`.

## Versioned administration actions

Send the administration record's `version` as `expected_version`, together with a controlled `reason_code`, for user updates and deletion. Never substitute a profile timestamp or increment the version locally. Updates hydrate the server's returned version. Deletion returns no body. A `409` or `422` is passed back to the caller; a stale action needs a fresh read and a newly reviewed action.

## Idempotency

The supported adapters are administration user update/delete, profile avatar/phone/address set/remove, article creation/hero replacement, and article publish/archive/restore. Each generates an `Idempotency-Key` for a new call. To retry an operation after an uncertain outcome, retain a key before calling the adapter and supply the same key with the same payload (and same file for uploads):

```ts
const options = { idempotencyKey: crypto.randomUUID() }
await api.administration.users.updateUser(
  token,
  user.id,
  {
    expected_version: user.version,
    reason_code: 'access_review',
    role_ids: selectedRoleIds,
  },
  options,
)
```

Keep `options` for a retry of that action; create a new key when the action or payload changes. The backend accepts one printable non-whitespace ASCII key of at most 128 characters, excluding commas, and retains replay records for 24 hours. The header is separate from audit `operationId` and `requestId` fields.

Other existing operations do not send this header. There are no automatic network, conflict, or server-error retries. Authentication recovery retries authenticated account/administration and `articles/me` requests once after a `401`, retaining the original payload and key while replacing the bearer token. Password-reset and explicitly session-preserving requests are excluded.

Session listing, individual revocation, and all-session revocation use `account/sessions` under the configured `/api/v1` base, with bearer authentication, CSRF, and cookies.
