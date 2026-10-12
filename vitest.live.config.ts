import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/shared/api/__tests__/*.live.spec.ts'],
      testTimeout: 15_000,
      hookTimeout: 15_000,
    },
  }),
)
