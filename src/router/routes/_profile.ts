import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'profile',
  name: 'profile',
  component: () => import('@/views/profile/ProfileView.vue'),
  meta: { contentKey: 'settings', requiresAuth: true },
  children: [],
}

export default route
