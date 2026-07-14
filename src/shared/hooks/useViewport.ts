import { computed, readonly, ref } from 'vue'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

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

enum BREAKPOINTS {
  SM = 576,
  MD = 768,
  LG = 992,
  XL = 1200,
  XXL = 1400,
}

export function useViewport() {
  const breakpoint = computed<Breakpoint>(() => {
    if (width.value >= BREAKPOINTS.XXL) return 'xxl'
    if (width.value >= BREAKPOINTS.XL) return 'xl'
    if (width.value >= BREAKPOINTS.LG) return 'lg'
    if (width.value >= BREAKPOINTS.MD) return 'md'
    if (width.value >= BREAKPOINTS.SM) return 'sm'

    return 'xs'
  })

  return {
    width: readonly(width),
    height: readonly(height),
    breakpoint,
    isMobile: computed<boolean>(() => width.value < BREAKPOINTS.MD),
    isTablet: computed<boolean>(
      () => width.value >= BREAKPOINTS.MD && width.value < BREAKPOINTS.XXL,
    ),
    isTabletUp: computed<boolean>(() => width.value >= BREAKPOINTS.MD),
    isDesktop: computed<boolean>(() => width.value >= BREAKPOINTS.XXL),
  }
}
