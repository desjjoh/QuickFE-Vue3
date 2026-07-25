import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

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
      component: () => import('@/app/AppFrame.vue'),
      children: [...routes],
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

export default router
