<template>
  <Transition name="scroll-top">
    <IconButton
      v-if="isVisible"
      size="lg"
      class="scroll__btn"
      :icon="ArrowUp"
      @click="scrollToTop"
    />
  </Transition>
</template>

<script setup lang="ts">
import IconButton from '@/shared/components/buttons/IconButton.vue'
import { ArrowUp } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  scrollRef: HTMLElement | null
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 400,
})

const scrollY = ref<number>(0)

let currentEl: HTMLElement | null = null

const updateScroll = (): void => {
  if (!currentEl) return
  scrollY.value = currentEl.scrollTop
}
const isVisible = computed<boolean>(() => {
  return scrollY.value > props.threshold
})

const scrollToTop = (): void => {
  if (!currentEl) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  currentEl.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })
}

const bind = (el: HTMLElement | null): void => {
  if (currentEl) currentEl.removeEventListener('scroll', updateScroll)

  currentEl = el

  if (currentEl) {
    updateScroll()
    currentEl.addEventListener('scroll', updateScroll, { passive: true })
  }
}

watch(
  () => props.scrollRef,
  (el) => bind(el),
  { immediate: true },
)

onBeforeUnmount(() => {
  if (currentEl) currentEl.removeEventListener('scroll', updateScroll)
})
</script>

<style lang="scss" scoped>
.scroll__btn {
  position: fixed;

  z-index: z-index(floating);
  right: space(5);
  bottom: space(5);
}
</style>
