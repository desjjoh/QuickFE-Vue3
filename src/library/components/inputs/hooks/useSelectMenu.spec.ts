import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import { mountHook } from '@test/support/mount'
import { mockAnimationFrames } from '@test/support/browser'
import { useSelectMenu } from './useSelectMenu'

const mocks = vi.hoisted(() => ({ activate: vi.fn(), deactivate: vi.fn() }))
vi.mock('focus-trap', () => ({ createFocusTrap: () => mocks }))
vi.mock('@floating-ui/vue', () => ({
  useFloating: () => ({ floatingStyles: computed(() => ({})) }),
  autoUpdate: vi.fn(),
  flip: vi.fn(),
  offset: vi.fn(),
  size: vi.fn(),
}))

describe('select menu keyboard, disabled and cleanup states', () => {
  it('does not activate a focus trap after unmounting during a queued open', async () => {
    const { result, wrapper } = mountHook(() =>
      useSelectMenu({
        options: () => ['a'],
        disabled: () => false,
        selectedIndex: ref(0),
        select: vi.fn(),
      }),
    )
    result.menuEl.value = document.createElement('div')
    const opening = result.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    wrapper.unmount()
    await opening
    expect(mocks.activate).not.toHaveBeenCalled()
  })
  it('wraps keyboard navigation, supports home/end and selects the active value', async () => {
    const select = vi.fn()
    const { result, wrapper } = mountHook(() =>
      useSelectMenu({
        options: () => ['a', 'b', 'c'],
        disabled: () => false,
        selectedIndex: ref(1),
        select,
      }),
    )
    await result.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(result.isOpen.value).toBe(true)
    expect(result.activeIndex.value).toBe(1)
    result.onMenuKeydown(new KeyboardEvent('keydown', { key: 'End' }))
    expect(result.activeIndex.value).toBe(2)
    result.onMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(result.activeIndex.value).toBe(0)
    result.onMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(result.activeIndex.value).toBe(2)
    result.onMenuKeydown(new KeyboardEvent('keydown', { key: 'Home' }))
    result.onMenuKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(select).toHaveBeenCalledExactlyOnceWith('a')
    expect(result.isOpen.value).toBe(false)
    wrapper.unmount()
  })
  it('ignores empty selections, repeated keys and disabled input', async () => {
    const disabled = ref(true)
    const select = vi.fn()
    const { result } = mountHook(() =>
      useSelectMenu({
        options: () => [],
        disabled: () => disabled.value,
        selectedIndex: ref(-1),
        select,
      }),
    )
    await result.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(result.isOpen.value).toBe(false)
    disabled.value = false
    await result.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    result.onMenuKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(select).not.toHaveBeenCalled()
    result.onMenuKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', repeat: true }))
    expect(result.activeIndex.value).toBe(0)
    disabled.value = true
    await nextTick()
    expect(result.isOpen.value).toBe(false)
    result.selectOption('forbidden')
    expect(select).not.toHaveBeenCalled()
  })
  it('dismisses outside clicks and cancels pending pointer work on unmount', async () => {
    const frames = mockAnimationFrames()
    const { result, wrapper } = mountHook(() =>
      useSelectMenu({
        options: () => ['a', 'b'],
        disabled: () => false,
        selectedIndex: ref(0),
        select: vi.fn(),
      }),
    )
    await result.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(result.isOpen.value).toBe(false)
    await result.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
    result.onOptionPointerMove(1)
    expect(frames.pending()).toBe(1)
    wrapper.unmount()
    frames.flush()
    expect(result.activeIndex.value).toBe(0)
    expect(frames.cancel).toHaveBeenCalledOnce()
  })
})
