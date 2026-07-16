<template>
  <Transition name="page-load-progress">
    <div
      v-if="isVisible"
      class="page-load-progress"
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(progress)"
    >
      <div class="page-load-progress__bar" :style="barStyle"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { usePageLoadProgress } from '@/shared/hooks/usePageLoadProgress'

const router = useRouter()
const { barStyle, finishPageLoad, isVisible, progress, resetPageLoadProgress, startPageLoad } =
  usePageLoadProgress()

let isTrackingInternalNavigation = false
let hasActiveRouterNavigation = false

void router.isReady().then(() => {
  isTrackingInternalNavigation = true
})

const removeBeforeEach = router.beforeEach(() => {
  if (!isTrackingInternalNavigation) return

  hasActiveRouterNavigation = true
  startPageLoad()
})

const removeAfterEach = router.afterEach(() => {
  if (!hasActiveRouterNavigation) return

  hasActiveRouterNavigation = false
  finishPageLoad()
})

const removeErrorHandler = router.onError(() => {
  if (!hasActiveRouterNavigation) return

  hasActiveRouterNavigation = false
  finishPageLoad()
})

onBeforeUnmount(() => {
  removeBeforeEach()
  removeAfterEach()
  removeErrorHandler()
  resetPageLoadProgress()
})
</script>

<style scoped lang="scss">
.page-load-progress {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;

  height: space(0.5);
  overflow: hidden;

  background: color(theme, neutral, theme-alpha, 6);

  pointer-events: none;
  z-index: z-index(debug);
}

.page-load-progress__bar {
  width: 100%;
  height: 100%;

  background: color(theme, primary, theme, 10);

  transform-origin: left center;
  transition: transform 180ms ease-out;
}
</style>
