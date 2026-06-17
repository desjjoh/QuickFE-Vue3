import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'dashboard',
  name: 'dashboard',
  redirect: { name: 'dashboard-overview' },
  component: () => import('@/modules/dashboard/DashboardView.vue'),
  meta: { contentKey: 'dashboard', scrollToTop: true },
  children: [
    {
      path: 'overview',
      name: 'dashboard-overview',
      component: () => import('@/modules/dashboard/pages/overview/DashboardOverview.vue'),
    },
    {
      path: 'clients',
      name: 'dashboard-clients',
      redirect: { name: 'dashboard-client-management' },
      component: () => import('@/shared/components/routers/RouterView.vue'),
      children: [
        {
          path: '',
          name: 'dashboard-client-management',
          component: () => import('@/modules/dashboard/pages/clients/ClientManagement.vue'),
        },
        {
          path: ':id',
          name: 'dashboard-client-manager',
          component: () => import('@/modules/dashboard/pages/clients/ClientManager.vue'),
        },
      ],
    },
  ],
}

export default route
