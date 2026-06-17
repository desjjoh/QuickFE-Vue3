import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  component: () => import('@/views/settings/SettingsView.vue'),
  meta: { contentKey: 'administration', requiresAuth: true },
}

export default route
