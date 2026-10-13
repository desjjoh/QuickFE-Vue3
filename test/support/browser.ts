import { vi } from 'vitest'
import { initViewport } from '@/shared/hooks/useViewport'

export function setTestViewport(width: number, height = 900) {
  vi.stubGlobal('innerWidth', width)
  vi.stubGlobal('innerHeight', height)
  initViewport()
  window.dispatchEvent(new Event('resize'))
}

export function mockAnimationFrames() {
  let nextId = 0
  const callbacks = new Map<number, FrameRequestCallback>()
  const request = vi.fn((callback: FrameRequestCallback) => {
    const id = ++nextId
    callbacks.set(id, callback)
    return id
  })
  const cancel = vi.fn((id: number) => callbacks.delete(id))
  vi.stubGlobal('requestAnimationFrame', request)
  vi.stubGlobal('cancelAnimationFrame', cancel)
  return {
    request,
    cancel,
    pending: () => callbacks.size,
    flush: (timestamp = 0) => {
      const pending = [...callbacks.values()]
      callbacks.clear()
      pending.forEach((callback) => callback(timestamp))
    },
  }
}
