import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'dashboard',
  name: 'dashboard',
  component: () => import('@/views/dashboard/DashboardView.vue'),
  meta: { contentKey: 'dashboard', requiresAuth: true },
}

export default route
