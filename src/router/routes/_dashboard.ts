import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'dashboard',
  name: 'dashboard',
  redirect: { name: 'dashboard-overview' },
  component: () => import('@/views/dashboard/DashboardView.vue'),
  meta: { contentKey: 'dashboard' },
  children: [
    {
      path: '',
      name: 'dashboard-overview',
      component: () => import('@/views/dashboard/pages/DashboardOverview.vue'),
    },
    {
      path: 'clients',
      name: 'dashboard-client-management',
      component: () => import('@/views/dashboard/pages/ClientManagement.vue'),
    },
  ],
}

export default route
