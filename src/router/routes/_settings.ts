import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'settings',
  name: 'settings',
  redirect: { name: 'settings-security' },
  component: () => import('@/views/settings/SettingsView.vue'),
  meta: { contentKey: 'settings', requiresAuth: true, pageTitle: 'app.routes.settings' },
  children: [
    {
      path: 'security',
      name: 'settings-security',
      component: () => import('@/views/settings/pages/AccountView.vue'),
    },
    {
      path: 'profile',
      name: 'settings-profile',
      component: () => import('@/views/settings/pages/ProfileView.vue'),
    },
  ],
}

export default route
