import { describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { useDebounceFn } from '@/shared/hooks/useDebounce'
import { useSearchFilter } from '@/shared/hooks/useSearchFilter'
import { useLocalStorageUtil } from '@/shared/hooks/useLocalStorage'
import { useTestClock } from '@test/support/async'
import { mountHook } from '@test/support/mount'

describe('debounce and search lifecycle', () => {
  it('cancels stale pending edits when an external search value arrives', async () => {
    const clock = useTestClock()
    const props = reactive({ value: 'initial', debounceMs: 100 })
    const emit = vi.fn()
    const { result } = mountHook(() => useSearchFilter(props, emit))
    result.value.value = 'pending'
    await nextTick()
    props.value = 'external'
    await nextTick()
    await clock.advance(100)
    expect(emit).not.toHaveBeenCalled()
    expect(result.value.value).toBe('external')
  })
  it('runs only the latest arguments and cancels pending work on unmount', async () => {
    const clock = useTestClock()
    const callback = vi.fn()
    const { result, wrapper } = mountHook(() => useDebounceFn(callback, 100))
    result('old')
    await clock.advance(50)
    result('latest')
    await clock.advance(99)
    expect(callback).not.toHaveBeenCalled()
    await clock.advance(1)
    expect(callback).toHaveBeenCalledExactlyOnceWith('latest')
    result('cancelled')
    wrapper.unmount()
    await clock.advance(100)
    expect(callback).toHaveBeenCalledOnce()
  })
  it('supports explicit cancellation, repeated cancellation and zero-delay execution', async () => {
    const clock = useTestClock()
    const callback = vi.fn()
    const { result } = mountHook(() => useDebounceFn(callback, 0))
    result()
    result.cancel()
    result.cancel()
    await clock.advance(0)
    expect(callback).not.toHaveBeenCalled()
    result()
    await clock.advance(0)
    expect(callback).toHaveBeenCalledOnce()
  })
  it('synchronizes external search values without feedback and emits the latest edit', async () => {
    const clock = useTestClock()
    const props = reactive({ value: 'initial', debounceMs: 100 })
    const emit = vi.fn()
    const { result } = mountHook(() => useSearchFilter(props, emit))
    props.value = 'external'
    await nextTick()
    await clock.advance(100)
    expect(result.value.value).toBe('external')
    expect(emit).not.toHaveBeenCalled()
    result.value.value = 'old'
    await nextTick()
    result.value.value = 'new'
    await nextTick()
    await clock.advance(100)
    expect(emit).toHaveBeenCalledExactlyOnceWith('update', 'new')
  })
  it('clears immediately without a duplicate delayed update', async () => {
    const clock = useTestClock()
    const emit = vi.fn()
    const { result } = mountHook(() =>
      useSearchFilter(reactive({ value: 'query', debounceMs: 100 }), emit),
    )
    result.clear()
    await nextTick()
    await clock.advance(100)
    expect(emit).toHaveBeenCalledExactlyOnceWith('update', undefined)
  })
  it('submits once, cancels queued updates, and skips disabled focus', async () => {
    const clock = useTestClock()
    const emit = vi.fn()
    const props = reactive({ value: '', disabled: true, debounceMs: 100 })
    const { result, wrapper } = mountHook(() => useSearchFilter(props, emit))
    const input = document.createElement('input')
    const focus = vi.spyOn(input, 'focus')
    result.inputRef.value = input
    result.focusInput()
    expect(focus).not.toHaveBeenCalled()
    result.value.value = 'next'
    await nextTick()
    result.submit()
    await clock.advance(100)
    expect(emit).toHaveBeenCalledExactlyOnceWith('submit', 'next')
    result.value.value = 'stale'
    await nextTick()
    wrapper.unmount()
    await clock.advance(100)
    expect(emit).toHaveBeenCalledOnce()
  })
})

describe('local storage contracts and failures', () => {
  it('round-trips falsy, nested and null values without mutating caller data', () => {
    const storage = useLocalStorageUtil<unknown>('test-key')
    expect(storage.getItem()).toBeNull()
    for (const value of [false, 0, '', null, { items: [1, 2] }]) {
      storage.saveItem(value)
      expect(storage.getItem()).toEqual(value)
    }
    storage.destroyItem()
    storage.destroyItem()
    expect(storage.getItem()).toBeNull()
  })
  it('recovers from corrupt JSON and removes only its own invalid entry', () => {
    const storage = useLocalStorageUtil<unknown>('test-key')
    localStorage.setItem('test-key', '{broken')
    localStorage.setItem('unrelated', 'keep')
    expect(storage.getItem()).toBeNull()
    expect(localStorage.getItem('test-key')).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
  it('validates parsed values and removes unsupported types without losing falsy valid values', () => {
    const storage = useLocalStorageUtil<number>(
      'test-key',
      (value): value is number => typeof value === 'number' && Number.isFinite(value),
    )
    for (const value of ['wrong', {}, [], null, false]) {
      localStorage.setItem('test-key', JSON.stringify(value))
      expect(storage.getItem()).toBeNull()
      expect(localStorage.getItem('test-key')).toBeNull()
    }
    storage.saveItem(0)
    expect(storage.getItem()).toBe(0)
  })
  it('recovers from denied reads, writes and removals without logging or throwing', () => {
    const storage = useLocalStorageUtil<unknown>('test-key')
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError')
      })
    }
    expect(storage.getItem()).toBeNull()
    expect(() => storage.saveItem('new')).not.toThrow()
    expect(() => storage.destroyItem()).not.toThrow()
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })
  it('handles a blocked localStorage getter and exhausted quota while preserving serialization errors', () => {
    const storage = useLocalStorageUtil<unknown>('test-key')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(() => storage.saveItem('new')).not.toThrow()
    expect(() => storage.saveItem(1n)).toThrow(TypeError)
    const cyclic: { self?: unknown } = {}
    cyclic.self = cyclic
    expect(() => storage.saveItem(cyclic)).toThrow(TypeError)
    const write = vi.mocked(Storage.prototype.setItem)
    write.mockClear()
    storage.saveItem(undefined)
    expect(write).not.toHaveBeenCalled()
    const getter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    try {
      expect(storage.getItem()).toBeNull()
      expect(() => storage.saveItem('new')).not.toThrow()
      expect(() => storage.destroyItem()).not.toThrow()
    } finally {
      getter.mockRestore()
    }
  })
})
