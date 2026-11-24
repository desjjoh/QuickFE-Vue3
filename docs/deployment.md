# Deployment

[Documentation index](../README.md#documentation)

## Static build

Run `npm run build` with the intended `VITE_API_BASE_URL`. Serve `dist/` with
history fallback to `index.html` for Vue Router routes. Configure the deployed
frontend origin in NestJS and verify credentialed CORS, TLS, CSRF, and refresh
cookies in the deployment topology. See [Configuration](configuration.md).

## Docker

```sh
docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1 -t quickfe-vue3 .
npm run security:image -- quickfe-vue3
```

The [Dockerfile](../Dockerfile) builds under Node and serves the static bundle
with nginx. Its current local topology copies `certs/localhost.pem` and
`certs/localhost-key.pem` and serves HTTPS on port **8080**. The
[local Compose file](../docker-compose.yaml) publishes that port. A production
topology still needs defined TLS ownership and explicit build configuration.

## Deployment exposure evidence

The build records package versions, rendered modules, and asset hashes in
`reports/browser-bundle-exposure.json`. The image check verifies the exact
image's assets, nginx configuration, HTTPS history fallback, and exclusion of
Node and build dependencies from the runtime filesystem. CI checks an
unpublished image with disposable certificates.

See [Security](security.md) for the production dependency gate and the
[deployment reference](archive/deployment-reference.md) for the evidence
formats and publication design.

## Release and rollback

Release publication, immutable rollback rehearsal, production smoke tests,
and hosted qualification are tracked in the [backlog](backlog.md). The
reusable CI workflow is available for a future release gate.
