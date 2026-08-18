import type { RouteRecordRaw } from 'vue-router'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import type { AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  redirect: { name: 'administration-user-management' },
  component: () => import('@/views/administration/AdministrationView.vue'),
  meta: { contentKey: 'administration', requiresAuth: true },
  children: [
    {
      path: 'overview',
      name: 'administration-overview',
      component: () => import('@/views/administration/pages/AdministrationOverview.vue'),
    },
    {
      path: 'users',
      name: 'administration-user-management',
      component: () => import('@/views/administration/pages/UserManagement.vue'),
      beforeEnter: async (to) => {
        await useAdministrationUsersStore().loadUsers(
          normalizePaginatedQuery(to.query, { page: 1, take: 10 }) as AdministrationUsersQuery,
        )
      },
    },
  ],
}

export default route
