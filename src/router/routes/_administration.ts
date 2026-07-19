import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'administration',
  name: 'administration',
  component: () => import('@/views/administration/AdministrationView.vue'),
  meta: { contentKey: 'administration', requiresAuth: true },
}

export default route
