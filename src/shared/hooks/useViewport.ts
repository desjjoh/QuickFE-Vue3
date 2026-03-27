import { computed, readonly, ref } from 'vue'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const width = ref<number>(0)
const height = ref<number>(0)

let initialized = false

const updateViewport = (): void => {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

export const initViewport = (): void => {
  if (initialized || typeof window === 'undefined') return

  initialized = true
  updateViewport()

  window.addEventListener('resize', updateViewport, { passive: true })
}

export function useViewport() {
  const breakpoint = computed<Breakpoint>(() => {
    if (width.value >= 1280) return 'xl'
    if (width.value >= 1024) return 'lg'
    if (width.value >= 768) return 'md'
    if (width.value >= 640) return 'sm'

    return 'xs'
  })

  return {
    width: readonly(width),
    height: readonly(height),
    breakpoint,
    isMobile: computed<boolean>(() => width.value < 768),
    isTabletUp: computed<boolean>(() => width.value >= 768),
    isDesktop: computed<boolean>(() => width.value >= 1024),
  }
}
