import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/shared/stores/auth'
import { useRouteDataStore } from '@/shared/stores/route-data'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: { name: 'template' },
      component: () => import('@/app/AppFrame.vue'),
      children: [...routes],
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

router.beforeEach(async () => {
  const authStore = useAuthStore()

  await authStore.initialize().catch(() => undefined)
})

router.afterEach((to, _from, failure) => {
  if (!failure) useRouteDataStore().cancelPending(to)
})

export default router
