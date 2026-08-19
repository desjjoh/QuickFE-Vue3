import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/shared/stores/auth'
import type { PermissionKey, RoleKey } from '@/config/permissions'

declare module 'vue-router' {
  interface RouteMeta {
    pageTitle?: string

    contentKey?: string

    requiresAuth?: boolean
    requiredRoles?: readonly RoleKey[]
    requiredPermissions?: readonly PermissionKey[]

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

router.beforeEach(async () => {
  const authStore = useAuthStore()

  await authStore.initialize().catch(() => undefined)
})

export default router
