import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'videos',
  name: 'videos',
  meta: { contentKey: 'videos', pageTitle: 'app.routes.videos' },
  component: () => import('@/views/videos/VideoFeed.vue'),
}

export default route
