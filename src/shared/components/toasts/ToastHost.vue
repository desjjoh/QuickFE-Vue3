<template>
  <div
    v-if="toasts.length"
    class="toast-host"
    :class="`toast-host--${position}`"
    :style="hostStyle"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup
      name="toast-stack"
      tag="div"
      class="toast-host__list"
      :class="`toast-host__list--${position}`"
    >
      <BaseToast
        v-for="toast in toasts"
        :key="toast.id"
        :toast="toast"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type ComputedRef } from 'vue'

import BaseToast from './BaseToast.vue'
import { useToastStore, type ToastItem, type ToastStore } from '@/stores/toasts'

type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

interface Props {
  scrollRef: HTMLElement | null
  position?: ToastPosition
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
})

const { getToasts, removeToast }: ToastStore = useToastStore()
const toasts: ComputedRef<ToastItem[]> = computed(() => getToasts)

const scrollbarRight = ref(0)
const scrollbarBottom = ref(0)

let currentEl: HTMLElement | null = null
let observer: ResizeObserver | null = null

const updateScrollbarCompensation = (): void => {
  if (!currentEl) {
    scrollbarRight.value = 0
    scrollbarBottom.value = 0
    return
  }

  scrollbarRight.value = currentEl.offsetWidth - currentEl.clientWidth
  scrollbarBottom.value = currentEl.offsetHeight - currentEl.clientHeight
}

const bindScrollElement = (el: HTMLElement | null): void => {
  observer?.disconnect()
  currentEl = el

  if (!currentEl) {
    scrollbarRight.value = 0
    scrollbarBottom.value = 0
    return
  }

  updateScrollbarCompensation()

  observer = new ResizeObserver(() => {
    updateScrollbarCompensation()
  })

  observer.observe(currentEl)
}

watch(
  () => props.scrollRef,
  (el) => {
    bindScrollElement(el)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  observer?.disconnect()
})

const hostStyle = computed<Record<string, string>>(() => {
  return {
    '--toast-offset-right': `calc(${scrollbarRight.value}px)`,
    '--toast-offset-bottom': `calc(${scrollbarBottom.value}px)`,
  }
})
</script>

<style scoped lang="scss">
.toast-host {
  position: fixed;
  z-index: z-index(toast);
  pointer-events: none;
  padding: space(4);
  width: min(56rem, 100vw);
  box-sizing: border-box;
}

.toast-host__list {
  display: flex;
  flex-direction: column;
  gap: space(3);
}

.toast-host__list > * {
  pointer-events: auto;
}

.toast-host__list--top-right,
.toast-host__list--bottom-right {
  align-items: flex-end;
}

.toast-host__list--top-left,
.toast-host__list--bottom-left {
  align-items: flex-start;
}

.toast-host__list--top-center,
.toast-host__list--bottom-center {
  align-items: center;
}

.toast-host--top-right {
  top: $masthead-height;
  right: var(--toast-offset-right, 0px);
}

.toast-host--top-left {
  top: $masthead-height;
  left: 0;
}

.toast-host--top-center {
  top: $masthead-height;
  left: 50%;
  transform: translateX(-50%);
}

.toast-host--bottom-right {
  right: var(--toast-offset-right, 0px);
  bottom: var(--toast-offset-bottom, 0px);
}

.toast-host--bottom-left {
  left: 0;
  bottom: var(--toast-offset-bottom, 0px);
}

.toast-host--bottom-center {
  left: 50%;
  bottom: var(--toast-offset-bottom, 0px);
  transform: translateX(-50%);
}
</style>
