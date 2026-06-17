import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'template',
  name: 'template',
  redirect: { name: 'template-home' },
  meta: { contentKey: 'template' },
  component: () => import('@/modules/template/TemplateView.vue'),
  children: [
    {
      path: '',
      name: 'template-home',
      component: () => import('@/modules/template/pages/HomePage.vue'),
    },
    {
      path: 'about',
      name: 'template-about',
      component: () => import('@/modules/template/pages/AboutPage.vue'),
    },
  ],
}

export default route
