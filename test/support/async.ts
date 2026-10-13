import { vi } from 'vitest'

export function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

// Opt in only for timer-driven tests; teardown restores real timers.
export function useTestClock(now: string | Date = '2026-01-01T12:00:00.000Z') {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(now))
  return {
    advance: (milliseconds: number) => vi.advanceTimersByTimeAsync(milliseconds),
    restore: () => {
      vi.clearAllTimers()
      vi.useRealTimers()
    },
  }
}
