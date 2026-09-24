import type { RouteRecordRaw } from 'vue-router'
import { useProfileStore } from '@/views/profile/stores/profile'

const route: RouteRecordRaw = {
  path: 'profile',
  name: 'profile',
  redirect: { name: 'profile-account' },
  component: () => import('@/views/profile/pages/ProfileView.vue'),
  meta: { contentKey: 'profile', requiresAuth: true, pageTitle: 'app.routes.profile' },
  children: [
    {
      path: 'account',
      name: 'profile-account',
      component: () => import('@/views/profile/AccountHome.vue'),
      beforeEnter: async () => {
        await useProfileStore().loadActivity()
      },
    },
  ],
}

export default route
