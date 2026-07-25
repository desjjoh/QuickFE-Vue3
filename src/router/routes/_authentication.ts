import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router'

import { isValidRouteQueryParam } from '@/helpers/routes'

const route: RouteRecordRaw = {
  path: 'authentication',
  component: () => import('@/shared/components/routers/RouterComponent.vue'),
  redirect: { name: 'root' },
  meta: { contentKey: 'authentication', isGuestRoute: true },
  children: [
    {
      path: 'reset-password',
      name: 'auth-reset-password',
      component: () => import('@/app/pages/PasswordResetView.vue'),
      beforeEnter: (to: RouteLocationNormalizedGeneric) => {
        const { token, token_id } = to.query

        if (!isValidRouteQueryParam(token) || !isValidRouteQueryParam(token_id))
          return { name: 'root' }
      },
    },
  ],
}

export default route
