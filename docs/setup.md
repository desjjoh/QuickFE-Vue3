# Setup

[Documentation index](../README.md#documentation)

Use Node.js 22.12 or newer and npm. The full supported Node range is in
[package.json](../package.json).

1. Install the locked dependencies with `npm ci`.
2. Copy [.env.example](../.env.example) to `.env` and set the API base URL.
3. Start QuickAPI-NestJS with its local dependencies and seed reference data.
4. Run `npm run dev` and open the origin printed by Vite.

Development uses strict port **5173**. Vite enables HTTPS when both
`certs/localhost.pem` and `certs/localhost-key.pem` exist. The preview serves the
production bundle over HTTP on the same port. See [Configuration](configuration.md)
for API origin and cookie requirements.

Run `npm run check` for the standard local checks, or `npm run build` to
type-check and produce `dist/`. [Testing](testing.md) covers browser and live API
commands. [Deployment](deployment.md) covers the Docker setup.

The optional [font download script](../scripts/download-google-fonts.ts) writes
assets under `public/fonts` and generates the library's font styles.
