import { describe, expect, it } from 'vitest'
import type { OutputBundle } from 'rollup'
import { collectBundleExposure, packageLocation } from './bundle-exposure'

function bundle(modules: Record<string, number>): OutputBundle {
  return {
    'app.js': {
      type: 'chunk',
      code: 'export const app = true',
      modules: Object.fromEntries(
        Object.entries(modules).map(([id, renderedLength]) => [id, { renderedLength }]),
      ),
    },
  } as unknown as OutputBundle
}

describe('browser package exposure evidence', () => {
  it('recognizes scoped, nested, Windows and queried package module paths', () => {
    expect(
      packageLocation('W:\\repo\\node_modules\\@vue\\runtime-dom\\dist\\index.js?commonjs'),
    ).toEqual({ name: '@vue/runtime-dom', root: 'W:/repo/node_modules/@vue/runtime-dom' })
    expect(packageLocation('/repo/node_modules/outer/node_modules/inner/index.js')).toEqual({
      name: 'inner',
      root: '/repo/node_modules/outer/node_modules/inner',
    })
    expect(packageLocation('/repo/src/app.ts')).toBeNull()
    expect(packageLocation('\0/repo/node_modules/property-expr/index.js?commonjs-proxy')).toEqual({
      name: 'property-expr',
      root: '/repo/node_modules/property-expr',
    })
  })
  it('records actual rendered packages and hashes final assets while ignoring tree-shaken modules', () => {
    const result = collectBundleExposure(
      bundle({
        '/repo/node_modules/vue/index.js': 20,
        '/repo/node_modules/@vue/server-renderer/index.js': 0,
        '/repo/src/app.ts': 10,
      }),
      () => '3.5.44',
    )
    expect(result.packages).toEqual([
      { name: 'vue', version: '3.5.44', renderedBytes: 20, chunks: ['app.js'] },
    ])
    expect(result.files[0]?.sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(result.files[0]?.bytes).toBe(23)
  })
  it('fails the build if server rendering or known build-only packages enter shipped code', () => {
    for (const name of ['@vue/server-renderer', '@vue/compiler-ssr', 'braces', 'esbuild']) {
      expect(() =>
        collectBundleExposure(
          bundle({ [`/repo/node_modules/${name}/index.js`]: 1 }),
          () => '1.0.0',
        ),
      ).toThrow('entered browser bundle')
    }
  })
  it('keeps different installed versions distinct and propagates missing package evidence', () => {
    const result = collectBundleExposure(
      bundle({
        '/repo/node_modules/vue/index.js': 20,
        '/repo/node_modules/outer/node_modules/vue/index.js': 10,
      }),
      (root) => (root.includes('outer') ? '3.5.43' : '3.5.44'),
    )
    expect(result.packages).toHaveLength(2)
    expect(() =>
      collectBundleExposure(bundle({ '/repo/node_modules/vue/index.js': 20 }), () => {
        throw new Error('Missing package manifest')
      }),
    ).toThrow('Missing package manifest')
  })
})
