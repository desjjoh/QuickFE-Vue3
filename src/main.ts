import '@/styles/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'

import router from '@/router'
import { i18n } from '@/i18n'

import { initViewport } from '@/shared/hooks/useViewport'
import { applyDirectives } from './shared/directives'

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

  // APPLY GLOBAL DIRECTIVES
  applyDirectives(app)

  // MOUNT APP
  app.mount('#app')
}

await bootstrap().catch((err: unknown) => {
  console.error(err)
})
