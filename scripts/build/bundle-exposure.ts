import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { OutputBundle } from 'rollup'
import type { Plugin } from 'vite'

export const excludedBrowserPackages = [
  '@vue/server-renderer',
  '@vue/compiler-ssr',
  'vite',
  'typescript',
  'esbuild',
  'sass',
  'sass-embedded',
  'eslint-plugin-vue',
  '@vue/eslint-config-typescript',
  'braces',
  'fast-glob',
  'micromatch',
]

export function packageLocation(moduleId: string) {
  const path = moduleId.replace(/^\0/, '').replaceAll('\\', '/').split('?')[0]!
  const marker = '/node_modules/'
  const index = path.lastIndexOf(marker)
  if (index < 0) return null
  const parts = path.slice(index + marker.length).split('/')
  const name = parts[0]!.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!
  return { name, root: path.slice(0, index + marker.length) + name }
}

export function collectBundleExposure(bundle: OutputBundle, readVersion: (root: string) => string) {
  const packages = new Map<
    string,
    { name: string; version: string; renderedBytes: number; chunks: Set<string> }
  >()
  const files = []
  for (const [fileName, output] of Object.entries(bundle)) {
    const content = output.type === 'chunk' ? output.code : output.source
    files.push({
      file: fileName,
      bytes: Buffer.byteLength(content),
      sha256: createHash('sha256').update(content).digest('hex'),
    })
    if (output.type !== 'chunk') continue
    for (const [id, module] of Object.entries(output.modules)) {
      if (module.renderedLength === 0) continue
      const location = packageLocation(id)
      if (!location) continue
      const version = readVersion(location.root)
      if (!version) throw new Error(`Missing package version: ${location.name}`)
      const key = `${location.name}@${version}`
      const entry = packages.get(key) ?? {
        name: location.name,
        version,
        renderedBytes: 0,
        chunks: new Set<string>(),
      }
      entry.renderedBytes += module.renderedLength
      entry.chunks.add(fileName)
      packages.set(key, entry)
    }
  }
  const rows = [...packages.values()]
    .map((entry) => ({ ...entry, chunks: [...entry.chunks].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name))
  for (const name of excludedBrowserPackages) {
    if (rows.some((entry) => entry.name === name))
      throw new Error(`Server/build dependency entered browser bundle: ${name}`)
  }
  return {
    version: 1,
    measurement: 'Rollup rendered module bytes before final minification; not transfer sizes',
    packages: rows,
    excludedBrowserPackages,
    files: files.sort((a, b) => a.file.localeCompare(b.file)),
  }
}

export function bundleExposure(): Plugin {
  return {
    name: 'bundle-exposure',
    apply: 'build',
    enforce: 'post',
    writeBundle(_options, bundle) {
      const versions = new Map<string, string>()
      const report = collectBundleExposure(bundle, (root) => {
        if (!versions.has(root))
          versions.set(root, JSON.parse(readFileSync(`${root}/package.json`, 'utf8')).version)
        return versions.get(root)!
      })
      mkdirSync('reports', { recursive: true })
      writeFileSync('reports/browser-bundle-exposure.json', JSON.stringify(report, null, 2) + '\n')
    },
  }
}
