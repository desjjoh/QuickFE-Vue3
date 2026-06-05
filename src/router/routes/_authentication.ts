import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router'

import { isValidRouteQueryParam } from '@/helpers/routes'

const route: RouteRecordRaw = {
  path: 'authentication',
  component: () => import('@/router/components/RouterView.vue'),
  redirect: { name: 'root' },
  meta: { contentKey: 'authentication', isGuestRoute: true },
  children: [
    {
      path: 'verify-email',
      name: 'auth-verity-email',
      component: () => import('@/shared/pages/ConfirmEmailView.vue'),
      beforeEnter: (to: RouteLocationNormalizedGeneric) => {
        const { token, token_id } = to.query

        console.log(token, token_id)

        if (!isValidRouteQueryParam(token) || !isValidRouteQueryParam(token_id))
          return { name: 'root' }
      },
    },
  ],
}

export default route
