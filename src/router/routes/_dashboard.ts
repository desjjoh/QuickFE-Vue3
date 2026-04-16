import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'dashboard',
  name: 'dashboard',
  component: () => import('@/views/dashboard/DashboardView.vue'),
  meta: { requiresAuth: true },
}

export default route
