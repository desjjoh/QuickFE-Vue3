# Dependency security review

## Targeted updates

- Vue and its compiler, runtime, shared, and server-renderer packages resolve to
  `3.5.44`. The declared Vue minimum is now `3.5.44`, with updates kept on the
  existing `3.5` line.
- `eslint-plugin-vue` resolves to `10.11.1`, with `postcss-selector-parser` at
  `7.1.6`. The plugin stays on version 10 with a patch update range.
- Deprecated `lucide-vue-next` is replaced by `@lucide/vue` at `1.56.0`.
  Source imports retain their existing icon names. Lucide's
  [migration guide](https://lucide.dev/guide/vue/migration) documents the package
  rename and removal of brand icons; this application does not import those
  removed brand icons.

Updates use normal npm dependency resolution, without forced audit fixes,
lockfile deletion, peer-dependency bypasses, or transitive overrides. Existing
lockfile updates from the preceding audit command are retained.

## Remaining development dependency finding

The installed chain is:

`@vue/eslint-config-typescript@14.9.0` → `fast-glob@3.3.3` →
`micromatch@4.0.8` → `braces@3.0.3`.

The [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
reports stack exhaustion from deeply nested patterns and currently lists no
patched version. npm counts the vulnerable package and its three dependents as
four high findings; these represent one underlying development-tool advisory.

The current Vue ESLint configuration uses fast-glob for Vue-file discovery.
This chain is not present in the production-only audit. That distinction does
not remove the development finding or approve an exception.

npm proposes downgrading `@vue/eslint-config-typescript` to `14.0.1` to remove
this chain. That version requires `eslint-plugin-vue@^9.28.0`, whereas this
application uses version 10. Applying the suggested downgrade would conflict
with the current lint setup. It has not been applied.

Follow-up options are a compatible upstream configuration release that removes
or patches the dependency, or a separately reviewed replacement of the Vue/TS
lint configuration that preserves its rules and Vue file handling. Do not force
an incompatible version merely to obtain a clean full audit.

## Verification and scope

### Lockfile compatibility review

Compared with the branch's committed lockfile, the combined audit and targeted
updates change 43 package-version entries, add `@lucide/vue`, and remove the old
Lucide package plus two redundant nested `xml-name-validator` installations.
The earlier audit's Axios `1.18.1` → `1.20.0`, Vitest `4.1.10` → `4.1.11`,
brace-expansion, and other compatible patch/minor updates are preserved.

The selector parser's `6.1.4` → `7.1.6` and XML name validator's `4.0.0` →
`5.0.0` changes are transitive major updates selected by the updated lint
plugin's declared dependencies. They are not forced overrides. Lucide's
replacement is an explicit migration to its new version-1 package.

All resolved lockfile packages use the npm registry and have integrity fields.
Vue has one installed version, `3.5.44`, with its nine core companion packages
aligned. The complete dependency-tree check reports no invalid or missing
dependencies. npm 12.1.0 still labels eight optional Sass/watcher-related
installations as extraneous after a clean `npm ci`; those packages are present
in the lockfile, and `npm explain sass` identifies Vite's optional Sass peer.
This warning is retained in the review rather than described as a completely
warning-free dependency tree.

### Blocked install-script review

The installed script files were inspected individually. No approval or script
allowlist changes were made.

| Package                 | Installed script behavior                                                                                                                                                                | Verification with script blocked                                                                | Decision                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `vue-demi@0.14.10`      | Detects Vue's major version and copies the appropriate bridge files inside its package. No download or subprocess in the Vue 3 branch.                                                   | Shipped bridge identifies Vue 3 and exports the same `ref` implementation as the installed Vue. | Keep blocked for this Vue 3 setup. Revisit if the Vue major changes.                                                         |
| `@parcel/watcher@2.5.6` | Its installed `build-from-source.js` invokes `node-gyp rebuild` only when source builds are requested.                                                                                   | The Windows platform's prebuilt native binding loads successfully.                              | Keep blocked while a compatible prebuilt package is available. Unsupported platforms require a separate source-build review. |
| `esbuild@0.28.1`        | Locates and validates a platform binary; may optimize its launcher. If the optional binary is missing, it can invoke npm or download a binary, with a hash check on the direct download. | The installed platform binary successfully transforms TypeScript without running postinstall.   | Keep blocked; retain optional binary dependencies rather than relying on the download fallback.                              |

These results describe the local Windows installation under npm 12.1.0's
existing script policy. They do not impose that policy on other npm versions,
CI, or Docker, and are not blanket approval of future script versions.

After a clean `npm ci`, 386 unit tests across 44 files and all 17 Chromium
browser tests passed. Browser tests used the newly built production application
with API fixtures and CI preview-server settings. Type checking, lint,
formatting, and the production build passed. The lockfile checksum remained
unchanged during verification. Firefox and WebKit were not verified in this pass.

Run production and full audits separately. A clean production audit does not
establish that development dependencies or the final container are free of
vulnerabilities. Recheck advisories when updating: this review describes the
dependency versions above, not a permanent security guarantee.

## Production security gate

Run `npm run security:audit` for a fresh production-only npm registry audit.
The command does not install packages or change the lockfile. It writes raw
evidence to `reports/production-audit.json` and the evaluated result to
`reports/production-audit-result.json`.

CI runs this command in the independent `Production security audit` job and
retains both reports for 14 days, including on failure. The final `Check` job
requires security success along with every existing verification job. The local
`npm run check` also includes this gate and therefore requires registry access.

High and critical advisories block unless an exact active exception applies.
Lower severities remain in the raw report. A failed command, registry error,
timeout, missing or invalid JSON, unsupported report schema, inconsistent
counts, incomplete dependency chains, missing lockfile versions, or invalid
exception policy blocks the gate. An audit error is never treated as a clean
report.

## Temporary production exceptions

`security/audit-exceptions.json` currently contains no approved exceptions.
Exceptions require code review and documented human risk acceptance; adding
an owner string is not evidence of approval. Use this shape only when a specific
temporary exception has actually been approved:

```json
{
  "version": 1,
  "exceptions": [
    {
      "advisory": "GHSA-abcd-efgh-2345",
      "package": "example-package",
      "versions": ["1.2.3"],
      "owner": "Responsible team or person",
      "justification": "Exposure assessment, mitigation, approval reference, and remediation issue",
      "expires": "2026-10-20T12:00:00Z"
    }
  ]
}
```

This is an illustrative example, not an approved exception. Scope is the exact
GHSA advisory, the underlying vulnerable package, and explicitly listed locked
versions. Do not exempt every affected parent package: npm can report several
dependents for the same underlying advisory. Additional advisories or installed
versions require their own reviewed scope.

Owners and justifications must be nonempty. Expiry is an exact UTC timestamp,
must be in the future, and cannot be more than 30 days away when evaluated.
Version ranges, wildcards, unknown fields, duplicate scopes, malformed dates,
expired exceptions, and wholly unused exceptions fail closed. Remove exceptions
when their underlying finding disappears; do not silently retain them for future
updates. Invalid policies block even when the production audit is otherwise clean.

`npm run test:ci` covers valid audits, transitive/cyclic findings, exact exception
matching, malformed and unavailable evidence, command failures, expiry boundaries,
policy validation, CLI failure behavior, and aggregate CI dependencies.

Weekly dependency-update configuration, generated browser-package evidence,
and mandatory runtime image inspection are described in
[Deployment](deployment.md). Full CI is reusable by a future release workflow;
Docker builds also require the production audit before compilation. No publishing
workflow or repository-protection changes are introduced yet.
