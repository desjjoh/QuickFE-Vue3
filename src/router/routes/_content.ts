import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'content',
  name: 'content',
  meta: { contentKey: 'content' },
  component: () => import('@/views/content/ContentView.vue'),
}

export default route
