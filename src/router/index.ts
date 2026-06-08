import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { getAppShellScrollContainer, getReducedMotionBehavior } from '@/helpers/window'

declare module 'vue-router' {
  interface RouteMeta {
    pageTitle?: string

    contentKey?: string

    requiresAuth?: boolean
    requiredRoles?: string[]

    isGuestRoute?: boolean
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
      component: () => import('@/shared/views/app/AppFrame.vue'),
      children: [...routes],
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
