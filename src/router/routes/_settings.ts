import type { RouteRecordRaw } from 'vue-router'

import { toAccountActivityQuery } from '@/shared/helpers/api-queries'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { useSettingsStore } from '@/views/settings/stores/settings.ts'

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
      component: () => import('@/views/settings/pages/ActivityView.vue'),
      beforeEnter: async (to) => {
        await useSettingsStore().loadActivity(
          toAccountActivityQuery(normalizePaginatedQuery(to.query, { page: 1, take: 10 })),
        )
      },
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
      beforeEnter: async () => {
        await useSettingsStore().loadSessions()
      },
    },
  ],
}

export default route
