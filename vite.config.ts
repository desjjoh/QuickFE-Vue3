import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [
    vue(),
    // vueDevTools()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/scss/globals" as *;
          @use "@/styles/scss/variables" as *;
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
