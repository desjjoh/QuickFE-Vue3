import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'news',
  name: 'news',
  meta: { contentKey: 'news', pageTitle: 'app.routes.news' },
  component: () => import('@/views/news/NewsFeed.vue'),
}

export default route
