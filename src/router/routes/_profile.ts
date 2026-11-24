import type { RouteRecordRaw } from 'vue-router'
import { profileActivityQuery } from '@/views/profile/helpers/activity-query'
import { useProfileStore } from '@/views/profile/stores/profile'

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
      meta: {
        dataLoader: {
          load: () => useProfileStore().loadActivity('feedActivity', { page: 1, take: 5 }),
          clear: () => useProfileStore().clearActivity('feedActivity'),
          error: () => useProfileStore().errors.feedActivity,
        },
      },
    },
    {
      path: 'activity',
      name: 'profile-activity',
      component: () => import('@/views/profile/pages/RecentActivity.vue'),
      meta: {
        dataLoader: {
          load: (to) =>
            useProfileStore().loadActivity('tableActivity', profileActivityQuery(to.query)),
          clear: () => useProfileStore().clearActivity('tableActivity'),
          error: () => useProfileStore().errors.tableActivity,
        },
      },
    },
  ],
}

export default route
