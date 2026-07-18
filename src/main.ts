import '@/styles/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'

import router from '@/router'
import { i18n } from '@/i18n'

import { useThemeStore } from '@/stores/theme'
import { initViewport } from '@/shared/hooks/useViewport'
import { useLocaleStore } from '@/stores/locale'

async function bootstrap(): Promise<void> {
  // CREATE APP
  const app = createApp(App)

  // APPLY MIDDLEWARE
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  // INITIATE GLOBAL HOOKS
  initViewport()

  // INITIALIZE PINIA STORES
  const themeStore = useThemeStore()
  const localeStore = useLocaleStore()

  themeStore.initialize()
  localeStore.initialize()

  // MOUNT APP
  app.mount('#app')
}

window.addEventListener('load', bootstrap, { once: true })
