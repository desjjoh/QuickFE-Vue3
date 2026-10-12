import type { RouteRecordRaw } from 'vue-router'
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
      beforeEnter: async () => {
        const store = useProfileStore()
        await store.loadActivity({ page: 1, take: 5 })
      },
    },
    {
      path: 'activity',
      name: 'profile-activity',
      redirect: (to) => ({ name: 'settings-activity', query: to.query, hash: to.hash }),
    },
  ],
}

export default route
