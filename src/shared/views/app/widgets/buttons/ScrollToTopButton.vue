<template>
  <Transition name="scroll-top">
    <IconButton
      v-if="isVisible"
      size="lg"
      radius="lg"
      tone="primary"
      class="scroll__btn"
      :class="`scroll__btn--${position}`"
      :style="buttonStyle"
      :icon="ArrowUp"
      @click="scrollToTop"
    />
  </Transition>
</template>

<script setup lang="ts">
import IconButton from '@/shared/components/buttons/IconButton.vue'
import { ArrowUp } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type ScrollButtonPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

interface Props {
  scrollRef: HTMLElement | null
  threshold?: number
  position?: ScrollButtonPosition
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 400,
  position: 'bottom-right',
})

const scrollY = ref<number>(0)
const scrollbarRight = ref<number>(0)
const scrollbarBottom = ref<number>(0)

let currentEl: HTMLElement | null = null
let observer: ResizeObserver | null = null

const updateScroll = (): void => {
  if (!currentEl) return
  scrollY.value = currentEl.scrollTop
}

const isVisible = computed<boolean>(() => {
  return scrollY.value > props.threshold
})

const updateScrollbarCompensation = (): void => {
  if (!currentEl) {
    scrollbarRight.value = 0
    scrollbarBottom.value = 0
    return
  }

  scrollbarRight.value = currentEl.offsetWidth - currentEl.clientWidth
  scrollbarBottom.value = currentEl.offsetHeight - currentEl.clientHeight
}

const scrollToTop = (): void => {
  if (!currentEl) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  currentEl.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })
}

const bind = (el: HTMLElement | null): void => {
  observer?.disconnect()

  if (currentEl) {
    currentEl.removeEventListener('scroll', updateScroll)
  }

  currentEl = el

  if (!currentEl) {
    scrollY.value = 0
    scrollbarRight.value = 0
    scrollbarBottom.value = 0
    return
  }

  updateScroll()
  updateScrollbarCompensation()

  currentEl.addEventListener('scroll', updateScroll, { passive: true })

  observer = new ResizeObserver(() => {
    updateScrollbarCompensation()
  })

  observer.observe(currentEl)
}

watch(
  () => props.scrollRef,
  (el) => bind(el),
  { immediate: true },
)

onBeforeUnmount(() => {
  observer?.disconnect()

  if (currentEl) {
    currentEl.removeEventListener('scroll', updateScroll)
  }
})

const buttonStyle = computed<Record<string, string>>(() => {
  return {
    '--scroll-btn-offset-right': `calc(${scrollbarRight.value}px + 1.6rem)`,
    '--scroll-btn-offset-bottom': `calc(${scrollbarBottom.value}px + 1.6rem)`,
  }
})
</script>

<style lang="scss" scoped>
.scroll__btn {
  position: fixed;
  z-index: z-index(floating);
  box-shadow: box-shadow(4);
}

.scroll__btn--top-right {
  top: calc($masthead-height + space(4));
  right: var(--scroll-btn-offset-right);
}

.scroll__btn--top-left {
  top: calc($masthead-height + space(4));
  left: space(4);
}

.scroll__btn--top-center {
  top: calc($masthead-height + space(4));
  left: 50%;
  transform: translateX(-50%);
}

.scroll__btn--bottom-right {
  bottom: var(--scroll-btn-offset-bottom);
  right: var(--scroll-btn-offset-right);
}

.scroll__btn--bottom-left {
  bottom: var(--scroll-btn-offset-bottom);
  left: space(4);
}

.scroll__btn--bottom-center {
  bottom: var(--scroll-btn-offset-bottom);
  left: 50%;
  transform: translateX(-50%);
}
</style>
