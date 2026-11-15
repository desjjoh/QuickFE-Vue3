# Configuration

[Documentation index](../README.md#documentation)

Set `VITE_API_BASE_URL` in a local `.env` or supply it to the production build.
Use the full NestJS API base, including `/api/v1`. The default is
`https://localhost:4000/api/v1`. The [configuration module](../src/config/env.ts)
trims surrounding whitespace and a trailing slash. Restart Vite when local
environment files change.

Vite embeds this public URL in the JavaScript bundle. Keep secrets and NestJS
operations credentials out of `VITE_*` variables. For Docker, pass
`VITE_API_BASE_URL` as a build argument. Changing it for a running nginx
container requires a new build.

Set NestJS CORS to allow the exact frontend origin and credentialed requests.
Use browser-trusted TLS and cookie settings compatible with the frontend and
backend origins. For a local HTTP NestJS instance, set
`VITE_API_BASE_URL=http://localhost:4000/api/v1` and use an HTTP frontend.
See [Security](security.md) for the request headers and [Deployment](deployment.md)
for production configuration.
