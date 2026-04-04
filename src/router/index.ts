import { createRouter, createWebHistory } from 'vue-router'
import { playground, template } from './routes'
import { getAppShellScrollContainer, getReducedMotionBehavior } from '@/helpers/window'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: { name: 'template' },
      component: () => import('@/router/views/AppFrame.vue'),
      children: [template, playground],
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

router.afterEach(() => {
  const scrollContainer = getAppShellScrollContainer()
  if (!scrollContainer) return

  const prefersReducedMotion = getReducedMotionBehavior()
  scrollContainer.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion,
  })
})

export default router
