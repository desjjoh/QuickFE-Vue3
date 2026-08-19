import '@/library/styles/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'

import router from '@/router'
import { i18n } from '@/shared/i18n'

import { useThemeStore } from '@/shared/stores/theme'
import { initViewport } from '@/shared/hooks/useViewport'
import { useLocaleStore } from '@/shared/stores/locale'
import { useSessionInterceptor } from './shared/hooks/useSessionInterceptor'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/shared/stores/auth'

async function bootstrap(): Promise<void> {
  // CREATE APP
  const app = createApp(App)

  // APPLY MIDDLEWARE
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  // INITIATE GLOBAL HOOKS
  useSessionInterceptor()
  initViewport()

  // INITIALIZE PINIA STORES
  const themeStore = useThemeStore()
  const localeStore = useLocaleStore()
  const authStore = useAuthStore()

  themeStore.initialize()
  localeStore.initialize()

  await authStore.initialize().catch((error: AxiosError) => {
    console.warn(error.message)
  })

  // MOUNT APP
  app.mount('#app')
}

window.addEventListener('load', bootstrap, { once: true })
