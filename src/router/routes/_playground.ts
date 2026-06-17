import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'playground',
  name: 'playground',
  component: () => import('@/views/playground/PlaygroundView.vue'),
  meta: { contentKey: 'playground', scrollToTop: true, pageTitle: 'app.routes.playground' },
}

export default route
