import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export function evaluateImageExposure(bundle, hashes, nodePaths) {
  if (bundle?.version !== 1 || !Array.isArray(bundle.files) || !bundle.files.length)
    throw new Error('Missing browser bundle evidence')
  if (nodePaths.trim()) throw new Error('Node application dependencies found in runtime image')
  const actual = new Map(
    hashes
      .trim()
      .split('\n')
      .map((line) => {
        const match = line.match(/^([a-f0-9]{64})\s+\/usr\/share\/nginx\/html\/(.+)$/)
        if (!match) throw new Error('Malformed runtime file hash evidence')
        return [match[2], match[1]]
      }),
  )
  for (const file of bundle.files) {
    if (actual.get(file.file) !== file.sha256)
      throw new Error(`Missing or changed runtime asset: ${file.file}`)
  }
  return {
    passed: true,
    verifiedBundleFiles: bundle.files.length,
    runtimeFiles: actual.size,
    nodeApplicationDependencies: false,
  }
}

function main() {
  try {
    const image = process.argv[2]
    if (!image) throw new Error('Usage: npm run security:image -- <locally-built-image>')
    const imageId = execFileSync('docker', ['image', 'inspect', image, '--format', '{{.Id}}'], {
      encoding: 'utf8',
    }).trim()
    const run = (command) =>
      execFileSync('docker', ['run', '--rm', '--entrypoint', 'sh', imageId, '-c', command], {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      })
    const nodePaths = run(
      'find / -path /proc -prune -o -path /sys -prune -o -path /dev -prune -o -name node_modules -print -o -name package.json -print',
    )
    run(
      'if command -v node >/dev/null 2>&1 || command -v npm >/dev/null 2>&1; then exit 1; fi; test ! -e /web; test ! -e /usr/share/nginx/html/reports/browser-bundle-exposure.json; nginx -t',
    )
    const hashes = run('find /usr/share/nginx/html -type f -exec sha256sum {} +')
    const bundle = JSON.parse(
      run('cat /usr/local/share/quickfe-evidence/browser-bundle-exposure.json'),
    )
    const result = { imageId, ...evaluateImageExposure(bundle, hashes, nodePaths) }
    const page = run(
      'nginx && wget --no-check-certificate -qO- https://127.0.0.1:8080/profile/activity',
    )
    if (!page.includes('<div id="app">') || !page.includes('/assets/'))
      throw new Error('HTTPS history-route smoke check failed')
    result.httpsHistoryFallback = true
    mkdirSync('reports', { recursive: true })
    writeFileSync(
      'reports/runtime-browser-bundle-exposure.json',
      JSON.stringify(bundle, null, 2) + '\n',
    )
    writeFileSync('reports/runtime-image-exposure.json', JSON.stringify(result, null, 2) + '\n')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    mkdirSync('reports', { recursive: true })
    writeFileSync(
      'reports/runtime-image-exposure.json',
      JSON.stringify({ passed: false, error: message }, null, 2) + '\n',
    )
    console.error(message)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
