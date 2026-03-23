import { createRouter, createWebHistory, type RouteLocationNormalizedGeneric } from 'vue-router'
import { playground, template } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: { name: 'template' },
      component: () => import('@/shared/views/AppLayout.vue'),
      children: [template, playground],
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeResolve((_to: RouteLocationNormalizedGeneric) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  } as ScrollToOptions)
})

export default router
