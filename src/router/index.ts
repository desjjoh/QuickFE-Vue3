import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/shared/stores/auth'
import { installRouteDataLifecycle } from './data-lifecycle'
import { useLibraryStore } from '@/shared/stores/library'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      meta: {
        dataLoader: {
          public: true,
          load: () => useLibraryStore().load(),
          clear: () => useLibraryStore().clear(),
          error: () => null,
        },
      },
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

installRouteDataLifecycle(router)

export default router
