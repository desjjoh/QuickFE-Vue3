import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router'

import { isValidRouteQueryParam } from '@/helpers/routes'

const route: RouteRecordRaw = {
  path: 'authentication',
  component: () => import('@/shared/components/routers/RouterView.vue'),
  redirect: { name: 'root' },
  meta: { contentKey: 'authentication', isGuestRoute: true },
  children: [
    {
      path: 'resend-verification-email',
      name: 'auth-resend-verification-email',
      component: () => import('@/shared/pages/authentication/ResendVerificationEmailView.vue'),
    },
    {
      path: 'password-reset',
      name: 'auth-password-reset-token',
      component: () => import('@/shared/pages/authentication/PasswordResetTokenView.vue'),
    },
    {
      path: 'verify-email',
      name: 'auth-verity-email',
      component: () => import('@/shared/pages/authentication/ConfirmEmailView.vue'),
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
