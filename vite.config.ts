import { fileURLToPath, URL } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const localKeyPath = './certs/localhost-key.pem'
const localCertPath = './certs/localhost.pem'

const useHttpsCerts = existsSync(localKeyPath) && existsSync(localCertPath)

export default defineConfig({
  server: {
    https: useHttpsCerts
      ? {
          key: readFileSync(localKeyPath),
          cert: readFileSync(localCertPath),
        }
      : undefined,
    port: 5173,
    strictPort: true,
  },
  preview: {
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
