import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { mountHook, mountLibrary, createTestRouter } from '@test/support/mount'
import { deferred } from '@test/support/async'
import { defineComponent } from 'vue'
import { useOverlayFlow } from '@/shared/hooks/useOverlayFlow'
import { useModalSubmit } from '@/shared/hooks/useModalSubmit'
import { useAuditDetailActions } from '@/views/administration/hooks/useAuditDetailActions'
import { useActivityFilters } from '@/views/administration/hooks/useActivityFilters'
import type { ActivityFilterDraft } from '@/views/administration/helpers/activity-filters'

const mocks = vi.hoisted(() => ({
  modal: { open: vi.fn(), close: vi.fn(), getOptions: { key: '' } },
  offcanvas: { open: vi.fn(), close: vi.fn(), closeAndWait: vi.fn(), $options: { key: '' } },
  toast: { addToast: vi.fn() },
  auth: { isAuthenticated: true, canActivate: vi.fn() },
}))
vi.mock('@/shared/stores/modal', () => ({ useModalStore: () => mocks.modal }))
vi.mock('@/shared/stores/offcanvas', () => ({ useOffcanvas: () => mocks.offcanvas }))
vi.mock('@/shared/stores/toasts', () => ({ useToastStore: () => mocks.toast }))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => reactive(mocks.auth) }))
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
  mocks.auth.canActivate.mockReturnValue(true)
  mocks.modal.getOptions.key = ''
  mocks.offcanvas.$options.key = ''
  mocks.modal.open.mockImplementation((options) => {
    mocks.modal.getOptions.key = options.key
  })
  mocks.offcanvas.open.mockImplementation((options) => {
    mocks.offcanvas.$options.key = options.key
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
