import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { mountHook, mountLibrary, createTestRouter } from '@test/support/mount'
import { deferred } from '@test/support/async'
import { defineComponent } from 'vue'
import { useOverlayFlow } from '@/shared/hooks/useOverlayFlow'
import { createSessionScope, SessionChangedError } from '@/shared/helpers/session-scope'
import { useOffcanvasSubmit } from '@/shared/hooks/useOffcanvasSubmit'
import { useModalSubmit } from '@/shared/hooks/useModalSubmit'
import { useAuditDetailActions } from '@/views/administration/hooks/useAuditDetailActions'
import { useActivityFilters } from '@/views/administration/hooks/useActivityFilters'
import type { ActivityFilterDraft } from '@/views/administration/helpers/activity-filters'

const mocks = vi.hoisted(() => ({
  modal: { $instanceKey: 'modal', open: vi.fn(), close: vi.fn(), getOptions: { key: '' } },
  offcanvas: {
    $instanceKey: 'panel',
    isOpen: true,
    open: vi.fn(),
    close: vi.fn(),
    closeAndWait: vi.fn(),
    $options: { key: '' },
  },
  toast: { addToast: vi.fn() },
  auth: {
    $sessionKey: 'session',
    user: null as { id: string } | null,
    isCurrentSession: vi.fn(),
    isAuthenticated: true,
    canActivate: vi.fn(),
  },
}))
vi.mock('@/shared/stores/modal', () => ({ useModalStore: () => mocks.modal }))
vi.mock('@/shared/stores/offcanvas', () => ({ useOffcanvas: () => mocks.offcanvas }))
vi.mock('@/shared/stores/toasts', () => ({ useToastStore: () => mocks.toast }))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => reactive(mocks.auth) }))
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.$sessionKey = 'session'
  mocks.auth.user = null
  mocks.auth.isCurrentSession.mockImplementation((key) => key === mocks.auth.$sessionKey)
  mocks.offcanvas.$instanceKey = 'panel'
  mocks.offcanvas.isOpen = true
  mocks.modal.$instanceKey = 'modal'
  mocks.auth.isAuthenticated = true
  mocks.auth.canActivate.mockReturnValue(true)
  mocks.modal.getOptions.key = ''
  mocks.offcanvas.$options.key = ''
  mocks.modal.open.mockImplementation((options) => {
    mocks.modal.getOptions.key = options.key
  })
  mocks.offcanvas.open.mockImplementation((options) => {
    mocks.offcanvas.$options.key = options.key
    mocks.offcanvas.$instanceKey = crypto.randomUUID()
    mocks.offcanvas.isOpen = true
  })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('overlay ownership and failure handling', () => {
  it('waits for an offcanvas close and does not open a modal when closing fails', async () => {
    const closing = deferred<void>()
    mocks.offcanvas.closeAndWait.mockReturnValue(closing.promise)
    const flow = useOverlayFlow()
    const options = { view: defineComponent({ render: () => null }) }
    const pending = flow.openModalAfterOffcanvasClose(options)
    expect(mocks.modal.open).not.toHaveBeenCalled()
    closing.resolve()
    await pending
    expect(mocks.modal.open).toHaveBeenCalledWith(options)
    mocks.modal.open.mockClear()
    mocks.offcanvas.closeAndWait.mockRejectedValue(new Error('close failed'))
    await expect(flow.openModalAfterOffcanvasClose(options)).rejects.toThrow('close failed')
    expect(mocks.modal.open).not.toHaveBeenCalled()
  })
  it('forwards successful submissions and reports errors without accidentally closing a retained form', async () => {
    const { handleModalSubmit } = useModalSubmit()
    const callback = vi.fn().mockResolvedValue(undefined)
    await handleModalSubmit(callback)('value')
    expect(callback).toHaveBeenCalledWith('value')
    expect(mocks.modal.close).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).not.toHaveBeenCalled()
    callback.mockRejectedValue(new Error('failed'))
    await handleModalSubmit(callback, { keepOpenOnError: true })()
    expect(mocks.modal.close).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).toHaveBeenCalledWith({ message: 'failed', tone: 'danger' })
    await handleModalSubmit(callback)()
    expect(mocks.modal.close).toHaveBeenCalledOnce()
  })
  it.each(['before-submit', 'late-failure', 'cancellation'])(
    'does not close or toast into a replacement session after %s',
    async (phase) => {
      const owner = { isAuthenticated: true, user: { id: 'A' }, $sessionKey: 'A' }
      const session = createSessionScope(owner)
      const wait = deferred<void>()
      const callback = vi.fn(() => wait.promise)
      const submit = useModalSubmit().handleModalSubmit(callback, { session })
      if (phase === 'before-submit') {
        owner.$sessionKey = 'B'
        await submit()
        expect(callback).not.toHaveBeenCalled()
      } else {
        const pending = submit()
        if (phase === 'late-failure') {
          owner.$sessionKey = 'B'
          wait.reject(new Error('old failure'))
        } else wait.reject(new SessionChangedError())
        await pending
      }
      expect(mocks.modal.close).not.toHaveBeenCalled()
      expect(mocks.toast.addToast).not.toHaveBeenCalled()
    },
  )
  it.each(['session', 'panel', 'modal'] as const)(
    'does not advance a closing offcanvas after %s replacement',
    async (change) => {
      const wait = deferred<void>()
      mocks.offcanvas.closeAndWait.mockReturnValue(wait.promise)
      const callback = vi.fn()
      const pending = useOverlayFlow().afterOffcanvasClose(callback)
      if (change === 'session') mocks.auth.$sessionKey = 'new-login'
      if (change === 'panel') mocks.offcanvas.$instanceKey = 'new-panel'
      if (change === 'modal') mocks.modal.$instanceKey = 'new-modal'
      wait.resolve()
      await pending
      expect(callback).not.toHaveBeenCalled()
    },
  )

  it.each(['close', 'replace', 'session', 'same-account-login'] as const)(
    'ignores an offcanvas submission failure after %s',
    async (change) => {
      mocks.auth.user = { id: 'A' }
      const wait = deferred<void>()
      const onError = vi.fn()
      const submit = useOffcanvasSubmit().handleOffcanvasSubmit(() => wait.promise, { onError })
      const pending = submit()
      if (change === 'close') mocks.offcanvas.isOpen = false
      if (change === 'replace') mocks.offcanvas.$instanceKey = 'replacement'
      if (change === 'session') {
        mocks.auth.$sessionKey = 'B'
        mocks.auth.user = { id: 'B' }
      }
      if (change === 'same-account-login') mocks.auth.$sessionKey = 'A-again'
      wait.reject(new Error('old failure'))
      await pending
      expect(onError).not.toHaveBeenCalled()
      expect(mocks.toast.addToast).not.toHaveBeenCalled()
      expect(mocks.offcanvas.close).not.toHaveBeenCalled()
    },
  )

  it('deduplicates offcanvas submission, retains inline errors, and allows retry', async () => {
    const wait = deferred<void>()
    const callback = vi
      .fn<(value: string) => Promise<void>>()
      .mockReturnValueOnce(wait.promise)
      .mockResolvedValue(undefined)
    const onError = vi.fn()
    const submit = useOffcanvasSubmit().handleOffcanvasSubmit(callback, {
      keepOpenOnError: true,
      onError,
    })
    const pending = submit('first')
    await submit('duplicate')
    expect(callback).toHaveBeenCalledExactlyOnceWith('first')
    wait.reject(new Error('apply failed'))
    await pending
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'apply failed' }))
    expect(mocks.offcanvas.close).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).not.toHaveBeenCalled()
    await submit('retry')
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('rejects stale submissions before issuing work and reports current failures', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('failed'))
    const submit = useOffcanvasSubmit().handleOffcanvasSubmit(callback)
    await submit()
    expect(mocks.offcanvas.close).toHaveBeenCalledOnce()
    expect(mocks.toast.addToast).toHaveBeenCalledWith({ message: 'failed', tone: 'danger' })
    mocks.offcanvas.$instanceKey = 'replacement'
    callback.mockClear()
    await submit()
    expect(callback).not.toHaveBeenCalled()
  })

  it('rejects audit access without permissions and closes only the owned modal on unmount', () => {
    const { result, wrapper } = mountHook(useAuditDetailActions)
    reactive(mocks.auth).isAuthenticated = false
    result.openAuditDetail('denied')
    expect(mocks.modal.open).not.toHaveBeenCalled()
    reactive(mocks.auth).isAuthenticated = true
    result.openAuditDetail('audit-one')
    expect(mocks.modal.open).toHaveBeenCalledWith(
      expect.objectContaining({ props: { auditId: 'audit-one' } }),
    )
    wrapper.unmount()
    expect(mocks.modal.close).toHaveBeenCalledOnce()
    mocks.modal.close.mockClear()
    const next = mountHook(useAuditDetailActions)
    next.result.openAuditDetail('audit-two')
    mocks.modal.getOptions.key = 'another-owner'
    next.wrapper.unmount()
    expect(mocks.modal.close).not.toHaveBeenCalled()
  })
  it('applies URL filters only for the active owned panel and cleans up on unmount', async () => {
    const router = await createTestRouter(
      [{ path: '/activity', name: 'administration-activity', component: { render: () => null } }],
      '/activity?page=3&take=25',
    )
    let actions!: ReturnType<typeof useActivityFilters>
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          actions = useActivityFilters()
          return () => null
        },
      }),
      { global: { plugins: [router] } },
    )
    actions.openActivityFilters()
    const options = mocks.offcanvas.open.mock.calls[0]![0] as {
      props: {
        onApply: (draft: ActivityFilterDraft) => Promise<void>
        onClear: () => Promise<void>
      }
    }
    await options.props.onApply({
      domain: 'articles',
      event: '',
      actorType: '',
      actorId: '',
      occurredFrom: '',
      occurredTo: '',
    })
    expect(router.currentRoute.value.query).toEqual({ take: '25', domain: 'articles' })
    expect(mocks.offcanvas.close).toHaveBeenCalledOnce()
    mocks.offcanvas.close.mockClear()
    vi.spyOn(router, 'replace').mockImplementationOnce(async () => {
      mocks.offcanvas.$options.key = 'replacement'
    })
    await options.props.onClear()
    expect(mocks.offcanvas.close).not.toHaveBeenCalled()
    mocks.offcanvas.$options.key = 'different'
    await options.props.onClear()
    expect(router.currentRoute.value.query.domain).toBe('articles')
    expect(mocks.offcanvas.close).not.toHaveBeenCalled()
    wrapper.unmount()
    expect(mocks.offcanvas.close).not.toHaveBeenCalled()
    let nextActions!: ReturnType<typeof useActivityFilters>
    const next = mountLibrary(
      defineComponent({
        setup() {
          nextActions = useActivityFilters()
          return () => null
        },
      }),
      { global: { plugins: [router] } },
    )
    nextActions.openActivityFilters()
    next.unmount()
    expect(mocks.offcanvas.close).toHaveBeenCalledOnce()
  })
})
