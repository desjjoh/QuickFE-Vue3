import { describe, expect, it, vi } from 'vitest'
import { withBrowserLock } from '@/shared/helpers/browser-lock'
import { deferred } from '@test/support/async'

describe('browser locks', () => {
  it('uses the named browser lock and propagates the work result', async () => {
    const request = vi.fn(async (_name: string, work: () => Promise<number>) => work())
    vi.stubGlobal('navigator', { locks: { request } })
    const work = vi.fn(async () => 42)
    await expect(withBrowserLock('session', work)).resolves.toBe(42)
    expect(request).toHaveBeenCalledWith('session', work)
    expect(work).toHaveBeenCalledOnce()
  })
  it('releases ownership after failure so queued work can proceed', async () => {
    let tail: Promise<unknown> = Promise.resolve()
    const request = vi.fn((_name: string, work: () => Promise<number>) => {
      const current = tail.catch(() => undefined).then(work)
      tail = current
      return current
    })
    vi.stubGlobal('navigator', { locks: { request } })
    const pending = deferred<number>()
    const first = withBrowserLock('session', () => pending.promise)
    const rejected = expect(first).rejects.toThrow('offline')
    const next = vi.fn(async () => 7)
    const second = withBrowserLock('session', next)
    expect(next).not.toHaveBeenCalled()
    pending.reject(new Error('offline'))
    await rejected
    await expect(second).resolves.toBe(7)
  })
  it.each([undefined, {}])(
    'uses existing coordination when Web Locks are unavailable: %s',
    async (locks) => {
      vi.stubGlobal('navigator', { locks })
      await expect(withBrowserLock('session', async () => 'fallback')).resolves.toBe('fallback')
    },
  )
})
