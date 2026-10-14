import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

const coveragePolicy: { include: string[]; exclude: string[] } = JSON.parse(
  readFileSync(new URL('./test/coverage-policy.json', import.meta.url), 'utf8'),
)

export default mergeConfig(
  viteConfig as Parameters<typeof mergeConfig>[0],
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['test/unit/**/*.spec.ts'],
      setupFiles: ['test/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
      unstubGlobals: true,
      unstubEnvs: true,
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        include: coveragePolicy.include,
        exclude: coveragePolicy.exclude,
        excludeAfterRemap: true,
        reportsDirectory: 'coverage',
        reporter: ['text', 'html', 'json', 'json-summary', 'lcov'],
        reportOnFailure: true,
      },
    },
  }),
)
