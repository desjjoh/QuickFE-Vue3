import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router'

import { isValidRouteQueryParam } from '@/helpers/routes'

const route: RouteRecordRaw = {
  path: 'authentication',
  component: () => import('@/shared/components/routers/RouterView.vue'),
  redirect: { name: 'root' },
  meta: { contentKey: 'authentication', isGuestRoute: true },
  children: [
    // EMAIL VERIFICATION
    {
      path: 'resend-verification-email',
      name: 'auth-resend-verification-email',
      component: () => import('@/app/pages/EmailTokenRequestView.vue'),
      meta: {
        emailTokenRequest: {
          kind: 'resendVerificationEmail',
          action: 'requestEmailVerification',
        },
      },
    },
    {
      path: 'verify-email',
      name: 'auth-verity-email',
      component: () => import('@/app/pages/ConfirmEmailView.vue'),
      beforeEnter: (to: RouteLocationNormalizedGeneric) => {
        const { token, token_id } = to.query

        if (!isValidRouteQueryParam(token) || !isValidRouteQueryParam(token_id))
          return { name: 'root' }
      },
    },
    // PASSWORD RESET
    {
      path: 'password-reset',
      name: 'auth-password-reset-token',
      component: () => import('@/app/pages/EmailTokenRequestView.vue'),
      meta: {
        emailTokenRequest: {
          kind: 'passwordResetToken',
          action: 'requestPasswordReset',
        },
      },
    },
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
