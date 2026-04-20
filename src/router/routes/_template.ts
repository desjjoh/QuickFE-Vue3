import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: 'template',
  name: 'template',
  redirect: { name: 'template-home' },
  meta: { contentKey: 'template' },
  component: () => import('@/views/template/TemplateView.vue'),
  children: [
    {
      path: '',
      name: 'template-home',
      component: () => import('@/views/template/pages/HomePage.vue'),
    },
    {
      path: 'about',
      name: 'template-about',
      component: () => import('@/views/template/pages/AboutPage.vue'),
    },
  ],
}

export default route
