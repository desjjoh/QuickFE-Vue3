import { describe, expect, it, vi } from 'vitest'
import { onBeforeUnmount, ref } from 'vue'
import { buildAudit, buildUser } from './fixtures'
import { deferred, useTestClock } from './async'
import { mountHook, createTestRouter } from './mount'
import { mockAnimationFrames, setTestViewport } from './browser'
import { useViewport } from '@/shared/hooks/useViewport'

describe('shared test support', () => {
  it('creates independent nested contracts without mutating fixture defaults or overrides', () => {
    const user = buildUser()
    const metadata = { label: 'Original' }
    const audit = buildAudit({ metadata })
    user.profile.name.first = 'Changed'
    expect(buildUser().profile.name.first).toBe('Test')
    audit.event = 'changed'
    expect(buildAudit().event).not.toBe('changed')
    metadata.label = 'Changed'
    expect(audit.metadata).toEqual({ label: 'Original' })
  })
  it('allows explicit resolution and rejection for stale-response tests', async () => {
    const success = deferred<string>()
    success.resolve('done')
    await expect(success.promise).resolves.toBe('done')
    const failure = deferred<string>()
    failure.reject(new Error('unavailable'))
    await expect(failure.promise).rejects.toThrow('unavailable')
  })
  it('advances a deterministic clock without real delays', async () => {
    const clock = useTestClock()
    const action = vi.fn()
    setTimeout(action, 100)
    await clock.advance(99)
    expect(action).not.toHaveBeenCalled()
    await clock.advance(1)
    expect(action).toHaveBeenCalledOnce()
    expect(new Date().toISOString()).toBe('2026-01-01T12:00:00.100Z')
    clock.restore()
  })
  it('mounts hooks in a real Vue lifecycle', () => {
    const cleanup = vi.fn()
    const { result, wrapper } = mountHook(() => {
      onBeforeUnmount(cleanup)
      return ref('ready')
    })
    expect(result.value).toBe('ready')
    wrapper.unmount()
    expect(cleanup).toHaveBeenCalledOnce()
  })
  it('flushes one animation frame at a time and supports cancellation', () => {
    const frames = mockAnimationFrames()
    const cancelled = vi.fn()
    cancelAnimationFrame(requestAnimationFrame(cancelled))
    requestAnimationFrame(() => requestAnimationFrame(vi.fn()))
    frames.flush()
    expect(cancelled).not.toHaveBeenCalled()
    expect(frames.pending()).toBe(1)
  })
  it('drives the existing viewport hook and an isolated memory router', async () => {
    setTestViewport(390)
    expect(useViewport().isMobile.value).toBe(true)
    setTestViewport(1600)
    expect(useViewport().isDesktop.value).toBe(true)
    const router = await createTestRouter(
      [{ path: '/test', component: { template: '<div />' } }],
      '/test?page=2',
    )
    expect(router.currentRoute.value.query.page).toBe('2')
  })
})
