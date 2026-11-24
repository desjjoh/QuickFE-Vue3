# Security

[Documentation index](../README.md#documentation)

## Browser and API boundaries

NestJS enforces authentication, permissions, and mutation policies. The frontend
uses bearer access tokens and sends credentialed cookies and `X-CSRF-Token` for
routes that require them. Allow `Authorization`, `Content-Type`,
`X-CSRF-Token`, and `Idempotency-Key` in NestJS CORS for the configured frontend
origin. See [Configuration](configuration.md) and [API contracts](api-contracts.md).

Deployment checks inspect the code rendered into the browser and nginx image.
See [Deployment](deployment.md#deployment-exposure-evidence) for the scope of the
runtime checks and [the archived dependency review](archive/dependency-security.md)
for previous findings.

## Production dependency gate

Run `npm run security:audit` for a production-only npm registry audit. CI retains
the raw audit and evaluated result for 14 days. High and critical findings
block the gate unless an approved exception applies. Unavailable reports,
invalid audit evidence, and invalid exception policies also block the gate.

[The exception policy](../security/audit-exceptions.json) takes exact advisory,
package, and locked version entries. Each temporary exception needs an owner,
reviewed justification, and UTC expiry within 30 days. The
[dependency security reference](archive/dependency-security.md#temporary-production-exceptions)
contains the schema example and validation rules.
