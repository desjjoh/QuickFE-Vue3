import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  redirect: { name: 'administration-overview' },
  component: () => import('@/views/administration/AdministrationView.vue'),
  meta: { contentKey: 'administration', requiresAuth: true },
  children: [
    {
      path: 'overview',
      name: 'administration-overview',
      component: () => import('@/views/administration/pages/AdministrationOverview.vue'),
    },
  ],
}

export default route
