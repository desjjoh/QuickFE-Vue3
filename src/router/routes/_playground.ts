import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'playground',
  name: 'playground',
  component: () => import('@/views/playground/PlaygroundView.vue'),
}

export default route
