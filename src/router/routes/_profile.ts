import type { RouteRecordRaw } from 'vue-router'
import { useProfileStore } from '@/views/profile/stores/profile'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'

const route: RouteRecordRaw = {
  path: 'profile',
  name: 'profile',
  redirect: { name: 'profile-account' },
  component: () => import('@/views/profile/ProfileView.vue'),
  meta: { contentKey: 'profile', requiresAuth: true, pageTitle: 'app.routes.profile' },
  children: [
    {
      path: 'account',
      name: 'profile-account',
      component: () => import('@/views/profile/pages/AccountHome.vue'),
      beforeEnter: async () => {
        await useProfileStore().loadAccountHomeActivity()
      },
    },
    {
      path: 'activity',
      name: 'profile-activity',
      component: () => import('@/views/profile/pages/RecentActivity.vue'),
      beforeEnter: async (to) => {
        const store = useProfileStore()
        await store.loadRecentActivity(
          normalizePaginatedQuery(to.query, {
            page: 1,
            take: 25,
          }) as AccountActivityQuery,
        )
      },
    },
  ],
}

export default route
