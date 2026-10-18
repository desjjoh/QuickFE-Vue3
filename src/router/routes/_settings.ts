import type { RouteRecordRaw } from 'vue-router'

import { useSettingsStore } from '@/views/settings/stores/settings.ts'
import { prepareRouteData } from '@/shared/stores/route-data'

const route: RouteRecordRaw = {
  path: 'settings',
  name: 'settings',
  redirect: { name: 'settings-security' },
  component: () => import('@/views/settings/SettingsView.vue'),
  meta: { contentKey: 'settings', requiresAuth: true, pageTitle: 'app.routes.settings' },
  children: [
    {
      path: 'activity',
      name: 'settings-activity',
      redirect: (to) => ({ name: 'profile-activity', query: to.query, hash: to.hash }),
    },
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
    {
      path: 'sessions',
      name: 'settings-sessions',
      component: () => import('@/views/settings/pages/SessionsView.vue'),
      meta: {
        dataLoader: {
          load: () => useSettingsStore().loadSessions(),
          clear: () => useSettingsStore().clearSessions(),
          error: () => useSettingsStore().sessionsError,
        },
      },
      beforeEnter: prepareRouteData,
    },
  ],
}

export default route
