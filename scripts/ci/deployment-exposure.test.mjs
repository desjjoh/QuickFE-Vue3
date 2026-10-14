import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evaluateImageExposure } from './image-exposure.mjs'

const hash = 'a'.repeat(64)
const bundle = { version: 1, files: [{ file: 'assets/app.js', sha256: hash }] }
const hashes = `${hash}  /usr/share/nginx/html/assets/app.js\n`
test('runtime evidence must match the built bundle and exclude Node packages', () => {
  assert.equal(evaluateImageExposure(bundle, hashes, '').passed, true)
  for (const [report, files, paths] of [
    [null, hashes, ''],
    [bundle, 'invalid', ''],
    [bundle, `${'b'.repeat(64)}  /usr/share/nginx/html/assets/app.js`, ''],
    [bundle, hashes, '/web/node_modules'],
    [bundle, `${hash}  /usr/share/nginx/html/other.js`, ''],
  ])
    assert.throws(() => evaluateImageExposure(report, files, paths))
})
test('Docker builds require the production audit before compiling and copy only static output into runtime', () => {
  const docker = readFileSync(new URL('../../Dockerfile', import.meta.url), 'utf8')
  assert.match(docker, /RUN npm run security:audit && npm run build/)
  const runtime = docker.slice(docker.indexOf('FROM nginx:'))
  assert.match(runtime, /COPY --from=build \/web\/dist \/usr\/share\/nginx\/html/)
  assert.doesNotMatch(runtime, /npm|node_modules|COPY \. /)
})
test('pull requests target checked branches without verification bypasses', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')
  assert.match(workflow, /pull_request:\s+branches: \[main, staging, dev\]/)
  assert.doesNotMatch(workflow, /paths-ignore|continue-on-error/)
})
test('full CI is reusable for future release verification and retains required exposure evidence', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')
  assert.match(workflow, /workflow_call:/)
  assert.match(
    workflow,
    /path: reports\/browser-bundle-exposure.json\s+retention-days: 14\s+if-no-files-found: error/,
  )
  const check = workflow.slice(workflow.indexOf('  check:'))
  assert.match(check, /needs:\s*\[[^\]]*security-audit[^\]]*runtime-image[^\]]*\]/)
})
