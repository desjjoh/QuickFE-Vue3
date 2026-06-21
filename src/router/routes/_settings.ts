import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'settings',
  name: 'settings',
  redirect: { name: 'settings-security' },
  component: () => import('@/views/settings/SettingsView.vue'),
  meta: { contentKey: 'settings', requiresAuth: true },
  children: [
    {
      path: 'security',
      name: 'settings-security',
      component: () => import('@/views/settings/pages/SecuritySettingsView.vue'),
    },
    {
      path: 'profile',
      name: 'settings-profile',
      component: () => import('@/views/settings/pages/ProfileSettingsView.vue'),
    },
  ],
}

export default route
