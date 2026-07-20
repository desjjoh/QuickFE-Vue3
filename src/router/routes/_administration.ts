import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  redirect: { name: 'administration-user-management' },
  component: () => import('@/views/administration/AdministrationView.vue'),
  meta: { contentKey: 'administration', requiresAuth: true },
  children: [
    {
      path: 'overview',
      name: 'administration-overview',
      component: () => import('@/views/administration/pages/AdministrationOverview.vue'),
    },
    {
      path: 'users',
      name: 'administration-user-management',
      component: () => import('@/views/administration/pages/UserManagement.vue'),
    },
  ],
}

export default route
