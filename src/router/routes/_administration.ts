import type { RouteRecordRaw } from 'vue-router'
import {
  useAdministrationActivityStore,
  ADMINISTRATION_ACTIVITY_DEFAULT_TAKE,
  normalizeAdministrationActivityQuery,
  toAdministrationAuditQuery,
} from '@/views/administration/stores/activity'
import {
  ADMINISTRATION_PERMISSIONS,
  ADMINISTRATION_ROLES,
  AuditPermissions,
  UserAdministrationPermissions,
} from '@/config/permissions'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { toAdministrationUsersQuery } from '@/shared/helpers/api-queries'
import {
  useAdministrationUsersStore,
  ADMINISTRATION_USERS_DEFAULT_TAKE,
} from '@/views/administration/stores/users'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  redirect: { name: 'administration-overview' },
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
      redirect: { name: 'administration-dashboard' },
      component: () => import('@/views/administration/pages/AdministrationPageLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'administration-dashboard',
          component: () => import('@/views/administration/pages/overview/OverviewDashboard.vue'),
          meta: { pageTitle: 'administration.navigation.items.overview' },
        },
        {
          path: 'activity',
          name: 'administration-activity',
          component: () => import('@/views/administration/pages/audit-log/AuditLog.vue'),
          meta: {
            requiredPermissions: [AuditPermissions.SEARCH_AUDIT],
            pageTitle: 'administration.navigation.items.auditLog',
            dataLoader: {
              load: async (to) => {
                const query = normalizeAdministrationActivityQuery(to.query, {
                  page: 1,
                  take: ADMINISTRATION_ACTIVITY_DEFAULT_TAKE,
                })

                await useAdministrationActivityStore().loadActivity(
                  toAdministrationAuditQuery(query),
                )
              },
              clear: () => useAdministrationActivityStore().clear(),
              error: () => useAdministrationActivityStore().error,
            },
          },
        },
      ],
    },
    {
      path: 'identity',
      name: 'administration-identity',
      redirect: { name: 'administration-user-management' },
      component: () => import('@/views/administration/pages/users/AdministrationUsers.vue'),
      meta: { requiredPermissions: [UserAdministrationPermissions.READ_USERS] },
      children: [
        {
          path: 'users',
          name: 'administration-user-management',
          component: () => import('@/views/administration/pages/users/pages/UserManagement.vue'),
          meta: {
            pageTitle: 'administration.identity.layout.title',
            dataLoader: {
              load: (to) =>
                useAdministrationUsersStore().loadUsers(
                  toAdministrationUsersQuery(
                    normalizePaginatedQuery(to.query, {
                      page: 1,
                      take: ADMINISTRATION_USERS_DEFAULT_TAKE,
                    }),
                  ),
                ),
              clear: () => useAdministrationUsersStore().clear(),
              error: () => useAdministrationUsersStore().error,
            },
          },
        },
      ],
    },
  ],
}

export default route
