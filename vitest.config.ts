import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig as Parameters<typeof mergeConfig>[0],
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['test/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
      unstubGlobals: true,
      unstubEnvs: true,
      exclude: [...configDefaults.exclude, 'test/e2e/**', 'scripts/ci/**', '**/*.live.spec.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
