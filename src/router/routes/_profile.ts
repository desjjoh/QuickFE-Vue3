import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'profile',
  name: 'profile',
  component: () => import('@/views/profile/ProfileView.vue'),
  meta: { contentKey: 'profile', requiresAuth: true, pageTitle: 'app.routes.profile' },
}

export default route
