import { afterEach, vi } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

// Vitest runs afterEach hooks in reverse registration order: unmount first.
afterEach(() => {
  if (vi.isFakeTimers()) {
    vi.clearAllTimers()
    vi.useRealTimers()
  }
  localStorage.clear()
  sessionStorage.clear()
})
enableAutoUnmount(afterEach)
