import { describe, expect, it, vi } from 'vitest'
import { createOverlayWorkflow } from '@/shared/helpers/overlay-workflow'
import { SessionChangedError } from '@/shared/helpers/session-scope'
import { deferred } from '@test/support/async'

function setup(user: { id: string } | null = { id: 'A' }) {
  const auth = {
    $sessionKey: 'login-A',
    user,
    isCurrentSession: (key: string) => key === auth.$sessionKey,
  }
  const overlay = { $instanceKey: 'opening-A', isOpen: true, close: vi.fn(), closeAndWait: vi.fn() }
  return { auth, overlay, workflow: createOverlayWorkflow(auth, overlay) }
}

describe('overlay workflow ownership', () => {
  it.each(['close', 'replace', 'session', 'account'] as const)(
    'rejects a late success after %s',
    async (change) => {
      const { auth, overlay, workflow } = setup()
      const wait = deferred<string>()
      const pending = workflow.request(() => wait.promise)
      if (change === 'close') overlay.isOpen = false
      if (change === 'replace') overlay.$instanceKey = 'opening-B'
      if (change === 'session') auth.$sessionKey = 'login-B'
      if (change === 'account') auth.user = { id: 'B' }
      wait.resolve('private result')
      await expect(pending).rejects.toBeInstanceOf(SessionChangedError)
      const effect = vi.fn()
      workflow.complete(effect)
      workflow.cancel()
      expect(effect).not.toHaveBeenCalled()
      if (change !== 'close') expect(overlay.close).not.toHaveBeenCalled()
    },
  )

  it('checks ownership before issuing a request and preserves ordinary failures', async () => {
    const { overlay, workflow } = setup()
    const callback = vi.fn().mockRejectedValue(new Error('failed'))
    await expect(workflow.request(callback)).rejects.toThrow('failed')
    overlay.$instanceKey = 'replacement'
    callback.mockClear()
    await expect(workflow.request(callback)).rejects.toBeInstanceOf(SessionChangedError)
    expect(callback).not.toHaveBeenCalled()
  })

  it.each(['guest', 'authenticated'])('completes a %s opening once', async (kind) => {
    const { overlay, workflow } = setup(kind === 'guest' ? null : { id: 'A' })
    expect(await workflow.request(async () => 'result')).toBe('result')
    const effect = vi.fn()
    workflow.complete(effect)
    workflow.complete(effect)
    workflow.cancel()
    expect(effect).toHaveBeenCalledOnce()
    expect(overlay.close).toHaveBeenCalledOnce()
  })

  it('cancels without allowing further work', async () => {
    const { overlay, workflow } = setup()
    workflow.cancel()
    workflow.cancel()
    expect(overlay.close).toHaveBeenCalledOnce()
    await expect(workflow.request(async () => {})).rejects.toBeInstanceOf(SessionChangedError)
  })

  it.each(['unchanged', 'session', 'replacement'] as const)(
    'waits for closing and rechecks %s ownership',
    async (change) => {
      const { auth, overlay, workflow } = setup(null)
      const wait = deferred<void>()
      overlay.closeAndWait.mockReturnValue(wait.promise)
      const effect = vi.fn()
      const pending = workflow.transition(effect)
      await workflow.transition(effect)
      expect(overlay.closeAndWait).toHaveBeenCalledOnce()
      expect(effect).not.toHaveBeenCalled()
      overlay.isOpen = false
      if (change === 'session') auth.$sessionKey = 'new-login'
      if (change === 'replacement') overlay.$instanceKey = 'new-panel'
      wait.resolve()
      await pending
      expect(effect).toHaveBeenCalledTimes(change === 'unchanged' ? 1 : 0)
    },
  )

  it('propagates a failed closing transition without advancing', async () => {
    const { overlay, workflow } = setup()
    overlay.closeAndWait.mockRejectedValue(new Error('closing failed'))
    const effect = vi.fn()
    await expect(workflow.transition(effect)).rejects.toThrow('closing failed')
    expect(effect).not.toHaveBeenCalled()
  })
})
