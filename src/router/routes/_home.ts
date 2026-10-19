import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: '',
  name: 'home',
  meta: { contentKey: 'home', pageTitle: 'app.routes.home' },
  component: () => import('@/views/home/HomeView.vue'),
}

export default route
