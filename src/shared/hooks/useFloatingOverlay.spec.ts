import { describe, expect, it, vi } from 'vitest'
import { computed, reactive, ref } from 'vue'
import { useFloatingOverlay } from './useFloatingOverlay'

const mocks = vi.hoisted(() => ({ floating: vi.fn(), auto: vi.fn(), cleanup: vi.fn() }))
vi.mock('@floating-ui/vue', () => ({
  offset: (options: unknown) => ({ name: 'offset', options }),
  flip: (options: unknown) => ({ name: 'flip', options }),
  useFloating: (...args: unknown[]) => mocks.floating(...args),
  autoUpdate: (...args: unknown[]) => mocks.auto(...args),
}))

describe('floating overlay orchestration', () => {
  it('reacts to placement/collision changes and removes ancestor listeners on cleanup', () => {
    mocks.auto.mockReturnValue(mocks.cleanup)
    mocks.floating.mockImplementation((_reference, _floating, options) => ({
      placement: computed(() => options.placement.value),
      floatingStyles: ref({}),
    }))
    const onScroll = vi.fn()
    const options = reactive({
      reference: ref<HTMLElement | null>(null),
      floating: ref<HTMLElement | null>(null),
      open: ref(true),
      side: 'bottom' as const,
      align: 'start' as 'start' | 'center',
      sideOffset: 8,
      alignOffset: 2,
      collisionPadding: 4,
      avoidCollisions: true,
    })
    // Keep the element refs intact; reactive option getters supply the changing values.
    const hookOptions = {
      reference: ref<HTMLElement | null>(null),
      floating: ref<HTMLElement | null>(null),
      open: ref(true),
      get side() {
        return options.side
      },
      get align() {
        return options.align
      },
      sideOffset: 8,
      alignOffset: 2,
      collisionPadding: 4,
      get avoidCollisions() {
        return options.avoidCollisions
      },
      onAncestorScroll: onScroll,
    }
    const result = useFloatingOverlay(hookOptions)
    expect(result.placement.value).toBe('bottom-start')
    options.align = 'center'
    expect(result.resolvedAlign.value).toBe('center')
    const configuration = mocks.floating.mock.calls[0]![2]
    expect(configuration.middleware.value.map((item: { name: string }) => item.name)).toEqual([
      'offset',
      'flip',
    ])
    options.avoidCollisions = false
    expect(configuration.middleware.value).toHaveLength(1)
    const cleanup = configuration.whileElementsMounted(
      document.createElement('button'),
      document.createElement('div'),
      vi.fn(),
    )
    document.dispatchEvent(new Event('scroll'))
    expect(onScroll).toHaveBeenCalledOnce()
    cleanup()
    document.dispatchEvent(new Event('scroll'))
    expect(onScroll).toHaveBeenCalledOnce()
    expect(mocks.cleanup).toHaveBeenCalledOnce()
  })
})
