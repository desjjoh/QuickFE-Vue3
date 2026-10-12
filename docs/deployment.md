# Deployment and operations

[Back to README](../README.md)

## Static build

`npm run build` runs Vue/TypeScript checks and produces `dist/`. Deploy those assets through a static server configured to fall back to `index.html` for Vue Router history routes. `npm run preview` is a local build check, not the production hosting strategy.

`VITE_API_BASE_URL` is substituted during the Vite build. Set it in the build environment or the appropriate Vite environment file before compiling. Setting an environment variable on a running nginx container does not reconfigure the JavaScript bundle; changing the API URL requires rebuilding.

## Current Docker setup

[Dockerfile](../Dockerfile) uses a Node 22 build stage and nginx runtime. It builds the app, copies `dist/`, loads [nginx.conf](../nginx.conf), and copies local `certs/` into the image. nginx listens with TLS on **8080**, and [Compose](../docker-compose.yaml) publishes that port with CPU/memory limits and a restart policy.

```powershell
npm run docker:build
npm run docker:up
npm run docker:status
npm run docker:down
```

The Compose build uses the project directory as its context. Its runtime environment currently sets the timezone only. The Dockerfile does **not** declare a `VITE_API_BASE_URL` build argument or runtime configuration mechanism, so a `--build-arg VITE_API_BASE_URL=...` invocation alone has no effect.

The copied certificate filenames are `localhost.pem` and `localhost-key.pem`; this is a local topology, not a complete production certificate/deployment design. The current `.dockerignore` does not exclude `.env` files. Resolve build configuration, build-context exclusions, and certificate ownership before treating this image as production-ready.

## Backend/browser coordination

Match the deployed frontend origin to QuickAPI's CORS configuration and credentialed cookie policy. Test TLS, CSRF, refresh-cookie rotation, expiry, and revoked sessions in the actual deployment topology. The browser's API configuration is public; operations secrets belong on the server/operations side.

QuickAPI's liveness, readiness, diagnostic information, system statistics, and Prometheus metrics are separate application-root endpoints. [DIAGNOSTICS_INVENTORY.md](DIAGNOSTICS_INVENTORY.md) records their formats and access guards. No frontend operations-token integration is implemented.

## Remaining deployment work

The repository has build/test gates, but it does not yet define a complete frontend release, rollback, observability, or production smoke-test procedure. See [Backlog](backlog.md) for these items and [Testing](testing.md) for the checks available today.
