import { afterEach, describe, expect, it, vi } from 'vitest'

import { usePageLoadProgress } from './usePageLoadProgress'

describe('usePageLoadProgress', () => {
  const progress = usePageLoadProgress()

  afterEach(() => {
    progress.resetPageLoadProgress()
    vi.useRealTimers()
  })

  it('hides after a page load finishes', () => {
    vi.useFakeTimers()

    progress.startPageLoad()
    progress.finishPageLoad()

    expect(progress.progress.value).toBe(100)
    expect(progress.isVisible.value).toBe(true)

    vi.runAllTimers()

    expect(progress.progress.value).toBe(0)
    expect(progress.isVisible.value).toBe(false)
  })

  it('waits for every overlapping page load before hiding', () => {
    vi.useFakeTimers()

    progress.startPageLoad()
    progress.startPageLoad()
    progress.finishPageLoad()

    vi.advanceTimersByTime(1_000)
    expect(progress.isVisible.value).toBe(true)

    progress.finishPageLoad()
    vi.runAllTimers()

    expect(progress.progress.value).toBe(0)
    expect(progress.isVisible.value).toBe(false)
  })
})
