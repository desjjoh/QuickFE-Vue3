import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'forums',
  name: 'forums',
  meta: { contentKey: 'forums', pageTitle: 'app.routes.forums' },
  component: () => import('@/views/forums/ForumsView.vue'),
}

export default route
