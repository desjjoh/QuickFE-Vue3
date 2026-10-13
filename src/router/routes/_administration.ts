import type { RouteRecordRaw } from 'vue-router'
import {
  useAdministrationActivityStore,
  normalizeAdministrationActivityQuery,
  toAdministrationAuditQuery,
} from '@/views/administration/stores/activity'
import {
  ADMINISTRATION_PERMISSIONS,
  ADMINISTRATION_ROLES,
  AuditPermissions,
  UserAdministrationPermissions,
  ArticleAdministrationPermissions,
} from '@/config/permissions'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { toAdministrationUsersQuery } from '@/shared/helpers/api-queries'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'

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
      redirect: { name: 'administration-activity' },
      component: () => import('@/views/administration/pages/overview/AdministrationOverview.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'administration-dashboard',
          component: () =>
            import('@/views/administration/pages/overview/pages/OverviewDashboard.vue'),
          meta: { pageTitle: 'administration.overview.dashboard.title' },
        },
        {
          path: 'activity',
          name: 'administration-activity',
          component: () =>
            import('@/views/administration/pages/overview/pages/PlatformActivity.vue'),
          meta: {
            requiredPermissions: [AuditPermissions.SEARCH_AUDIT],
            pageTitle: 'administration.overview.activity.title',
          },
          beforeEnter: async (to) => {
            const store = useAdministrationActivityStore()
            const query = normalizeAdministrationActivityQuery(to.query, {
              page: 1,
              take: store.pagination.take,
            })

            await store.loadActivity(toAdministrationAuditQuery(query))
          },
        },
      ],
    },
    {
      path: 'identity',
      name: 'administration-identity',
      redirect: { name: 'administration-user-management' },
      component: () => import('@/views/administration/pages/identity/AdministrationIdentity.vue'),
      meta: { requiredPermissions: [UserAdministrationPermissions.READ_USERS] },
      children: [
        {
          path: 'users',
          name: 'administration-user-management',
          component: () => import('@/views/administration/pages/identity/pages/UserManagement.vue'),
          meta: { pageTitle: 'administration.identity.users.title' },
          beforeEnter: async (to) => {
            const store = useAdministrationUsersStore()
            await store.loadUsers(
              toAdministrationUsersQuery(
                normalizePaginatedQuery(to.query, { page: 1, take: store.pagination.take }),
              ),
            )
          },
        },
      ],
    },
    {
      path: 'articles',
      name: 'administration-articles',
      redirect: { name: 'administration-article-management' },
      component: () => import('@/views/administration/pages/articles/AdministrationArticles.vue'),
      meta: { requiredPermissions: [ArticleAdministrationPermissions.READ_ARTICLES] },
      children: [
        {
          path: '',
          name: 'administration-article-management',
          component: () =>
            import('@/views/administration/pages/articles/pages/ArticleManagement.vue'),
          meta: { pageTitle: 'administration.articles.layout.title' },
        },
      ],
    },
  ],
}
export default route
