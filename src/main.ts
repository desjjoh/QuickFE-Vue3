import '@/styles/css/base.css'
import '@/styles/scss/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/views/App.vue'
import router from '@/router'

async function bootstrap(): Promise<void> {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

await bootstrap().catch((err: unknown) => {
  console.error(err)
})
