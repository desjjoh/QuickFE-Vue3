import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'settings',
  name: 'settings',
  component: () => import('@/views/settings/SettingsView.vue'),
  meta: { contentKey: 'settings', requiresAuth: true },
}

export default route
