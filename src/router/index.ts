import { createRouter, createWebHistory } from 'vue-router'
import { dashboard, playground, template } from './routes'
import { getAppShellScrollContainer, getReducedMotionBehavior } from '@/helpers/window'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    scrollToTop?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: { name: 'template' },
      component: () => import('@/router/views/app/AppFrame.vue'),
      children: [template, dashboard, playground],
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

router.afterEach(() => {
  const scrollContainer = getAppShellScrollContainer()
  if (!scrollContainer) return

  const prefersReducedMotion = getReducedMotionBehavior()
  scrollContainer.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion,
  })
})

export default router
