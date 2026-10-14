# Deployment and operations

[Back to README](../README.md)

## Static build

`npm run build` runs Vue/TypeScript checks and produces `dist/`. Deploy those assets through a static server configured to fall back to `index.html` for Vue Router history routes. `npm run preview` is a local build check, not the production hosting strategy.

`VITE_API_BASE_URL` is substituted during the Vite build. Set it in the build environment or the appropriate Vite environment file before compiling. Setting an environment variable on a running nginx container does not reconfigure the JavaScript bundle; changing the API URL requires rebuilding.

## Current Docker setup

[Dockerfile](../Dockerfile) uses a Node 22 build stage and nginx runtime. It requires the production security audit before building the app, copies `dist/`, loads [nginx.conf](../nginx.conf), and copies local `certs/` into the image. Bundle evidence is copied outside the served directory to `/usr/local/share/quickfe-evidence/`. nginx listens with TLS on **8080**, and [Compose](../docker-compose.yaml) publishes that port with CPU/memory limits and a restart policy.

```powershell
npm run docker:build
npm run docker:up
npm run docker:status
npm run docker:down
```

The Compose build uses the project directory as its context. Its runtime environment currently sets the timezone only. The Dockerfile accepts `--build-arg VITE_API_BASE_URL=...` during compilation; this public URL is not a secret and cannot be changed by setting a runtime nginx environment variable. Compose does not currently supply the argument itself.

The copied certificate filenames are `localhost.pem` and `localhost-key.pem`; this is a local topology, not a complete production certificate/deployment design. `.dockerignore` excludes local environment files, reports, and test output. Supply public build configuration explicitly and resolve production certificate ownership before treating this image as production-ready. CI generates disposable certificates only for testing the existing topology; its fixture image is never published.

## Deployment exposure evidence

Every production build writes `reports/browser-bundle-exposure.json`. It records
packages that contribute rendered code, their installed versions and chunks,
and hashes of emitted assets. Module byte counts precede final minification and
are not network transfer sizes. The report lives outside `dist/` and is retained
as a CI artifact. The build fails if the server-renderer, SSR compiler, or listed
build-only packages enter browser code.

The reviewed build contains 23 packages: Vue's runtime/reactivity/shared modules,
Vue Router, Pinia, Axios, Vue I18n and its Intlify modules, VeeValidate/Yup and
validation helpers, Floating UI, Lucide, Focus Trap and Tabbable. The actual
rendered modules exclude `@vue/server-renderer`, `@vue/compiler-ssr`, Vite,
TypeScript, esbuild, Sass, ESLint tooling, braces, fast-glob and micromatch.
This establishes the server-rendering advisory's affected code is absent from
this browser artifact; it is not an exception to the production npm audit.

Inspect an unpublished local image with:

```powershell
docker build --tag quickfe-vue3:exposure-review .
npm run security:image -- quickfe-vue3:exposure-review
```

The inspector resolves an immutable local image ID, reads that image's own build
report, verifies asset hashes inside nginx's served directory, checks nginx's
configuration and HTTPS history-route fallback, and rejects Node/npm binaries, `node_modules`, package manifests,
or the build workspace in the final filesystem. It does not compare a Windows
bundle with a separately compiled Linux bundle. Evidence is written to
`reports/runtime-image-exposure.json` and
`reports/runtime-browser-bundle-exposure.json`.

The runtime contains nginx/Alpine system packages, static application assets,
nginx configuration, local certificates, and the unserved bundle report. Node,
npm, server-renderer and application dependency installations stay in the build
stage. JavaScript library code remains inside the static assets, so absence of
`node_modules` does not mean absence of browser dependencies. Runtime inspection
is not a vulnerability scan of nginx or Alpine; those need a separate image scan.

CI requires runtime-image verification in the aggregate `Check`, in addition to
the production audit and browser tests.

## Future publication

The existing CI workflow now supports `workflow_call`. A future release workflow
must call it and make publication depend on its successful result:

```yaml
jobs:
  verify:
    uses: ./.github/workflows/ci.yml
    permissions:
      contents: read
      pull-requests: read
  publish:
    needs: verify
    if: ${{ needs.verify.result == 'success' }}
    runs-on: ubuntu-latest
    # Add scoped registry permissions, environment approvals, and publication
    # steps only when the release destination and production topology are defined.
```

This is a contract example, not an installed publication workflow. Do not publish
from `pull_request_target`, add bot-specific check exemptions, or use
`always()`/`continue-on-error` to bypass failed verification. Before registry
credentials or publication, a production candidate must pass a fresh production
audit and runtime/image verification. Preserve that exact approved artifact for
publication rather than rebuilding it afterward. CI's disposable-certificate
fixture image is not the production candidate.

No registry publication, release workflow, or repository-protection changes are
made by this setup. Those remain explicit work when release infrastructure is
introduced.

## Backend/browser coordination

Match the deployed frontend origin to QuickAPI's CORS configuration and credentialed cookie policy. Test TLS, CSRF, refresh-cookie rotation, expiry, and revoked sessions in the actual deployment topology. The browser's API configuration is public; operations secrets belong on the server/operations side.

QuickAPI's liveness, readiness, diagnostic information, system statistics, and Prometheus metrics are separate application-root endpoints. [DIAGNOSTICS_INVENTORY.md](DIAGNOSTICS_INVENTORY.md) records their formats and access guards. No frontend operations-token integration is implemented.

## Remaining deployment work

The repository has build/test gates, but it does not yet define a complete frontend release, rollback, observability, or production smoke-test procedure. See [Backlog](backlog.md) for these items and [Testing](testing.md) for the checks available today.
