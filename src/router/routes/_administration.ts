import type { RouteRecordRaw } from 'vue-router'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import {
  useAdministrationActivityStore,
  normalizeAdministrationActivityQuery,
  toAdministrationAuditQuery,
} from '@/views/administration/stores/activity'
import { toAdministrationUsersQuery } from '@/shared/helpers/api-queries'
import {
  ADMINISTRATION_PERMISSIONS,
  ADMINISTRATION_ROLES,
  UserAdministrationPermissions,
  AuditPermissions,
} from '@/config/permissions'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  redirect: { name: 'administration-user-management' },
  component: () => import('@/views/administration/AdministrationView.vue'),
  meta: {
    contentKey: 'administration',
    pageTitle: 'app.routes.administration',
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
      path: 'activity',
      name: 'administration-activity',
      component: () => import('@/views/administration/pages/PlatformActivity.vue'),
      meta: { requiredPermissions: [AuditPermissions.SEARCH_AUDIT] },
      beforeEnter: async (to) => {
        const store = useAdministrationActivityStore()
        const query = normalizeAdministrationActivityQuery(to.query, {
          page: 1,
          take: store.pagination.take,
        })

        await store.loadActivity(toAdministrationAuditQuery(query))
      },
    },
    {
      path: 'users',
      name: 'administration-user-management',
      component: () => import('@/views/administration/pages/UserManagement.vue'),
      meta: { requiredPermissions: [UserAdministrationPermissions.READ_USERS] },
      beforeEnter: async (to) => {
        const store = useAdministrationUsersStore()
        await store.loadUsers(
          toAdministrationUsersQuery(
            normalizePaginatedQuery(to.query, {
              page: 1,
              take: store.pagination.take,
            }),
          ),
        )
      },
    },
  ],
}

export default route
