<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :css="transition" name="router-view-fade" mode="out-in" appear>
      <div
        v-if="Component"
        :key="getRouterViewTransitionKey(route)"
        class="router-view-fade__target"
        :class="{ 'has-async-transition': transition }"
      >
        <ErrorBoundary :key="routerViewKey" :transition="transition" name="router-view-fade">
          <Suspense>
            <template #default>
              <component :is="Component" />
            </template>

            <template #fallback>
              <slot v-if="$slots.loading" name="loading"></slot>

              <FullContainer v-else class="router-view-fade__content router-view-async-fade">
                <BlockText class="loading" tone="inherit">
                  <SpinnerComponent />
                </BlockText>
              </FullContainer>
            </template>
          </Suspense>

          <template #error="{ error, clearError }">
            <slot v-if="$slots.error" name="error" :error="error" :reset="clearError"></slot>

            <FullContainer v-else>
              <BlockText class="error" tone="inherit">
                {{ error }}
              </BlockText>
            </FullContainer>
          </template>
        </ErrorBoundary>
      </div>
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { inject, ref, unref } from 'vue'
import { RouterView, viewDepthKey, type RouteLocationNormalizedLoadedGeneric } from 'vue-router'

import ErrorBoundary from '@/shared/components/error/ErrorBoundary.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import SpinnerComponent from '../progress/SpinnerComponent.vue'

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

function resetRouterView(): void {
  routerViewKey.value = Date.now()
}

defineExpose({
  resetRouterView,
})
</script>

<style lang="scss" scoped>
.router-view-fade__target {
  min-width: 0;
}

.router-view-async__content,
.router-view-async__fallback {
  min-width: 0;
}

.router-view-fade__target.has-async-transition .router-view-async__content {
  animation: router-view-async-enter 160ms ease both;
}

.loading {
  color: color(theme, neutral, theme-alpha, 11);
  max-width: space(125);
}

.error {
  color: color(theme, danger, theme-alpha, 11);
  max-width: space(125);
}

@keyframes router-view-async-enter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
