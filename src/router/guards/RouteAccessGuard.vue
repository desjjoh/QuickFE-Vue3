<template>
  <Transition name="router-view-fade" mode="out-in" appear>
    <ErrorSplashView v-if="loadError" :error="loadError" :reset="retry" />
    <UnauthorizedView
      v-else-if="displayedAccess === 'unauthorized'"
      :eyebrow="t('errors.unauthorized.eyebrow')"
      :title="t('errors.unauthorized.title')"
      :msg="t('errors.unauthorized.message')"
    />
    <UnauthorizedView
      v-else-if="displayedAccess === 'forbidden'"
      :eyebrow="t('errors.forbidden.eyebrow')"
      :title="t('errors.forbidden.title')"
      :msg="t('errors.forbidden.message')"
    />
    <slot v-else />
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import UnauthorizedView from '@/library/components/splash/UnauthorizedView.vue'
import ErrorSplashView from '@/library/components/splash/ErrorSplashView.vue'
import { routeAccess, routeDataLoaders } from '@/router/route-data'
import type { RouteAccess } from '@/shared/helpers/route-access'
import { useAuthStore } from '@/shared/stores/auth'
import { useRouteDataStore } from '@/shared/stores/route-data'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const data = useRouteDataStore()
const access = computed(() => routeAccess(route))
const displayedAccess = ref<RouteAccess>(access.value)
const loadError = shallowRef<Error>()
const retryKey = ref('')
const retry = () => {
  retryKey.value = crypto.randomUUID()
}

watch(
  () => ({
    fullPath: route.fullPath,
    path: route.path,
    userId: auth.user?.id,
    sessionKey: auth.$sessionKey,
    access: access.value,
    retry: retryKey.value,
  }),
  async (state, previous, onCleanup) => {
    const { userId, access: nextAccess } = state
    let active = true

    onCleanup(() => {
      active = false
    })
    if (nextAccess !== 'allowed') {
      displayedAccess.value = nextAccess
      loadError.value = undefined
      data.invalidate()

      return
    }

    // Existing table hooks own query-only reloads after the page is revealed.
    const samePage =
      previous &&
      previous.userId === userId &&
      previous.sessionKey === state.sessionKey &&
      previous.access === 'allowed' &&
      previous.retry === retryKey.value &&
      previous.path === state.path

    if (samePage && displayedAccess.value === 'allowed' && !loadError.value) return
    if (!routeDataLoaders(route).length || data.isPrepared(route)) {
      loadError.value = undefined
      displayedAccess.value = 'allowed'

      return
    }

    if (!previous || previous.userId !== userId || previous.sessionKey !== state.sessionKey) {
      displayedAccess.value = 'unauthorized'
      loadError.value = undefined
    }

    if (data.errorKey === data.keyFor(route) && (!previous || state.retry === previous.retry)) {
      loadError.value = data.error

      return
    }

    const ready = await data.prepare(route)

    if (!active) return
    if (ready) {
      loadError.value = undefined
      displayedAccess.value = 'allowed'
    } else if (data.errorKey === data.keyFor(route)) {
      loadError.value = data.error
    }
  },
  { immediate: true, flush: 'sync' },
)
</script>
