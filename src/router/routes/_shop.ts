import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'shop',
  name: 'shop',
  meta: { contentKey: 'shop', pageTitle: 'app.routes.shop' },
  component: () => import('@/views/shop/ShopView.vue'),
}

export default route
