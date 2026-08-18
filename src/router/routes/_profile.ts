import type { RouteRecordRaw } from 'vue-router'
import { useProfileStore } from '@/views/profile/stores/profile'

const route: RouteRecordRaw = {
  path: 'profile',
  name: 'profile',
  component: () => import('@/views/profile/ProfileView.vue'),
  meta: { contentKey: 'profile', requiresAuth: true, pageTitle: 'app.routes.profile' },
  beforeEnter: async () => {
    await useProfileStore().loadActivity()
  },
}

export default route
