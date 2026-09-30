import {
  autoUpdate,
  flip,
  offset,
  useFloating,
  type AutoUpdateOptions,
  type Middleware,
  type Placement,
} from '@floating-ui/vue'
import { computed, type ComputedRef, type Ref } from 'vue'

type Side = 'top' | 'bottom' | 'left' | 'right'
type Align = 'start' | 'center' | 'end'

type FloatingOverlayOptions = {
  reference: Ref<HTMLElement | null>
  floating: Ref<HTMLElement | null>
  open: Ref<boolean>
  side: Side
  align: Align
  sideOffset: number
  alignOffset: number
  collisionPadding: number
  avoidCollisions: boolean
  additionalMiddleware?: () => Middleware[]
  autoUpdateOptions?: AutoUpdateOptions
  onAncestorScroll?: () => void
}

export function useFloatingOverlay(options: FloatingOverlayOptions) {
  const placement: ComputedRef<Placement> = computed(() =>
    options.align === 'center' ? options.side : (`${options.side}-${options.align}` as Placement),
  )
  const middleware = computed<Middleware[]>(() => {
    const items: Middleware[] = [
      offset({ mainAxis: options.sideOffset, crossAxis: options.alignOffset }),
    ]
    if (options.avoidCollisions) items.push(flip({ padding: options.collisionPadding }))
    return items.concat(options.additionalMiddleware?.() ?? [])
  })
  const floating = useFloating(options.reference, options.floating, {
    placement,
    middleware,
    strategy: 'fixed',
    transform: false,
    open: options.open,
    whileElementsMounted(reference, floatingElement, update) {
      const cleanup = autoUpdate(reference, floatingElement, update, options.autoUpdateOptions)
      if (options.onAncestorScroll)
        document.addEventListener('scroll', options.onAncestorScroll, {
          capture: true,
          passive: true,
        })
      return () => {
        cleanup()
        if (options.onAncestorScroll)
          document.removeEventListener('scroll', options.onAncestorScroll, true)
      }
    },
  })
  const resolvedSide = computed(() => floating.placement.value.split('-')[0] ?? options.side)
  const resolvedAlign = computed(() => floating.placement.value.split('-')[1] ?? 'center')
  return { ...floating, placement, resolvedSide, resolvedAlign }
}
