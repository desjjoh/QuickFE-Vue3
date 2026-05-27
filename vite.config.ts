import { fileURLToPath, URL } from 'node:url'
import * as fs from 'node:fs'
import * as path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function getLocalHttpsConfig() {
  if (process.env.CI) return undefined

  const keyPath = path.resolve(process.cwd(), 'certs/localhost-key.pem')
  const certPath = path.resolve(process.cwd(), 'certs/localhost.pem')

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    return undefined
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }
}

export default defineConfig({
  server: {
    https: getLocalHttpsConfig(),
    port: 5173,
    strictPort: true,
  },
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/globals" as *;
          @use "@/styles/variables" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
