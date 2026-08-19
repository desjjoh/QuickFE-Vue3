<template>
  <Transition name="router-view-fade" mode="out-in" appear>
    <UnauthorizedView
      v-if="access === 'unauthorized'"
      :eyebrow="t('errors.unauthorized.eyebrow')"
      :title="t('errors.unauthorized.title')"
      :msg="t('errors.unauthorized.message')"
    />
    <UnauthorizedView
      v-else-if="access === 'forbidden'"
      :eyebrow="t('errors.forbidden.eyebrow')"
      :title="t('errors.forbidden.title')"
      :msg="t('errors.forbidden.message')"
    />
    <slot v-else />
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import UnauthorizedView from '@/library/components/splash/UnauthorizedView.vue'
import { evaluateRouteAccess, type RouteAccess } from '@/shared/helpers/route-access'
import { useAuthStore } from '@/shared/stores/auth'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

const requiresAuth = computed<boolean>(() => route.meta.requiresAuth ?? false)
const requiredRoles = computed<string[]>(() => route.meta.requiredRoles ?? [])

const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated)
const hasRequiredRole = computed<boolean>(() => authStore.hasRequiredRole(requiredRoles.value))

const access = computed<RouteAccess>(() =>
  evaluateRouteAccess(
    { requiresAuth: requiresAuth.value, requiredRoles: requiredRoles.value },
    isAuthenticated.value,
    hasRequiredRole.value,
  ),
)
</script>
