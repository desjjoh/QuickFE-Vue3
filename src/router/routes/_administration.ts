import type { RouteRecordRaw } from 'vue-router'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import type { AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'
import {
  ADMINISTRATION_PERMISSIONS,
  ADMINISTRATION_ROLES,
  UserAdministrationPermissions,
} from '@/config/permissions'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  redirect: { name: 'administration-user-management' },
  component: () => import('@/views/administration/AdministrationView.vue'),
  meta: {
    contentKey: 'administration',
    requiresAuth: true,
    requiredRoles: ADMINISTRATION_ROLES,
    requiredPermissions: ADMINISTRATION_PERMISSIONS,
  },
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
      meta: { requiredPermissions: [UserAdministrationPermissions.READ_USERS] },
      beforeEnter: async (to) => {
        const store = useAdministrationUsersStore()
        await store.loadUsers(
          normalizePaginatedQuery(to.query, {
            page: 1,
            take: store.pagination.take,
          }) as AdministrationUsersQuery,
        )
      },
    },
  ],
}

export default route
