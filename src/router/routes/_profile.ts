import type { RouteRecordRaw } from 'vue-router'
import { toAccountActivityQuery } from '@/shared/helpers/api-queries'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { useProfileStore, PROFILE_ACTIVITY_DEFAULT_TAKE } from '@/views/profile/stores/profile'

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
        const store = useProfileStore()
        await store.loadActivity('feedActivity', { page: 1, take: 5 })
      },
    },
    {
      path: 'activity',
      name: 'profile-activity',
      component: () => import('@/views/profile/pages/RecentActivity.vue'),
      beforeEnter: async (to) => {
        await useProfileStore().loadActivity(
          'tableActivity',
          toAccountActivityQuery(
            normalizePaginatedQuery(to.query, { page: 1, take: PROFILE_ACTIVITY_DEFAULT_TAKE }),
          ),
        )
      },
    },
  ],
}

export default route
