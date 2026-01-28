import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'template-layout',
          component: () => import('@/views/template/TemplateView.vue'),
          children: [
            {
              path: '',
              name: 'template-home',
              component: () => import('@/views/template/pages/HomePage.vue'),
            },
            {
              path: '/about',
              name: 'template-about',
              component: () => import('@/views/template/pages/AboutPage.vue'),
            },
          ],
        },
        {
          path: 'playground',
          name: 'playground',
          component: () => import('@/views/playground/PlaygroundView.vue'),
        },
      ],
    },
    {
      path: '/:catchAll(.*)',
      redirect: { name: 'root' },
    },
  ],
})

export default router
