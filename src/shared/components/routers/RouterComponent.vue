<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :css="transition" name="router-view-fade" mode="out-in" appear>
      <div
        v-if="Component"
        :key="getRouterViewTransitionKey(route)"
        class="router-view-fade__target"
      >
        <ErrorBoundary :transition="transition" name="router-view-fade">
          <Transition name="router-view-fade" mode="out-in" appear>
            <!-- <Suspense @pending="handleSuspensePending" @resolve="handleSuspenseResolve"> -->
            <Suspense>
              <template #default>
                <div class="router-view-async__content">
                  <component :is="Component" />
                </div>
              </template>

              <template #fallback>
                <div class="router-view-async__fallback">
                  <slot v-if="$slots.loading" name="loading"></slot>

                  <FullContainer v-else class="router-view-fade__content">
                    <BlockText class="loading" tone="inherit">
                      <SpinnerComponent />
                    </BlockText>
                  </FullContainer>
                </div>
              </template>
            </Suspense>
          </Transition>

          <template #error="{ error, clearError }">
            <slot v-if="$slots.error" name="error" :error="error" :reset="clearError"></slot>

            <ErrorSplashView v-else :error="error" :reset="clearError" />
          </template>
        </ErrorBoundary>
      </div>
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { inject, ref, unref } from 'vue'
import {
  RouterView,
  // useRouter,
  viewDepthKey,
  type RouteLocationNormalizedLoadedGeneric,
} from 'vue-router'
// import { usePageLoadProgress } from '@/shared/hooks/usePageLoadProgress'

import ErrorBoundary from '@/shared/components/error/ErrorBoundary.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import SpinnerComponent from '../progress/SpinnerComponent.vue'
import ErrorSplashView from '../splash/ErrorSplashView.vue'

// const router = useRouter()
// const { finishPageLoad, startPageLoad } = usePageLoadProgress()

// let isTrackingInternalSuspense = false
// const hasActiveSuspenseLoad = false

// void router.isReady().then(() => {
//   isTrackingInternalSuspense = true
// })

const routerViewKey = ref<number>(Date.now())
const injectedRouterViewDepth = inject(viewDepthKey, 0)

withDefaults(defineProps<{ transition?: boolean }>(), {
  transition: true,
})

function getRouterViewTransitionKey(route: RouteLocationNormalizedLoadedGeneric): string {
  let depth: number = unref(injectedRouterViewDepth)

  while (route.matched[depth] && !route.matched[depth]?.components) {
    depth += 1
  }

  const matchedRoute = route.matched[depth]

  return String(matchedRoute?.name ?? matchedRoute?.path ?? route.name ?? route.path)
}

// function handleSuspensePending(): void {
//   if (!isTrackingInternalSuspense) return

//   hasActiveSuspenseLoad = true
//   startPageLoad()
// }

// function handleSuspenseResolve(): void {
//   if (!hasActiveSuspenseLoad) return

//   hasActiveSuspenseLoad = false
//   finishPageLoad()
// }

function resetRouterView(): void {
  routerViewKey.value = Date.now()
}

defineExpose({
  resetRouterView,
})
</script>

<style lang="scss" scoped>
.router-view-fade__target {
  height: 100%;
  min-width: 0;
}

.router-view-async__content,
.router-view-async__fallback {
  height: 100%;
  min-width: 0;
}

.loading {
  color: color(theme, neutral, theme-alpha, 11);
  max-width: space(125);
}

.error {
  color: color(theme, danger, theme-alpha, 11);
  max-width: space(125);
}
</style>
