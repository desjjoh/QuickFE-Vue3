import '@/styles/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/views/App.vue'

import router from '@/router'
import { i18n } from '@/i18n'

async function bootstrap(): Promise<void> {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(i18n)

  app.mount('#app')
}

await bootstrap().catch((err: unknown) => {
  console.error(err)
})
