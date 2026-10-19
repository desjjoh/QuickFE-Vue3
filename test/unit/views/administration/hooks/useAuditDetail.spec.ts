import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref, reactive } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { mountLibrary } from '@test/support/mount'
import AuditDetailModal from '@/views/administration/pages/overview/components/AuditDetailModal.vue'
import ModalHost from '@/library/components/modal/ModalHost.vue'
import { useAdministrationActivityStore } from '@/views/administration/stores/activity'
import { useModalStore } from '@/shared/stores/modal'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { AuditDto } from '@/library/models/audit'
import { auditFixture } from '@test/support/api-fixtures'
import { useAuditDetail } from '@/views/administration/hooks/useAuditDetail'
import { deferred } from '@test/support/async'

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  auth: {
    $sessionKey: 'session-one',
    isAuthenticated: true,
    user: { id: 'admin-one' },
    canActivate: vi.fn(),
    getValidAccessToken: vi.fn(),
  },
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => reactive(mocks.auth) }))
vi.mock('focus-trap', () => ({
  createFocusTrap: () => ({ activate: vi.fn(), deactivate: vi.fn() }),
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ administration: { audits: { detail: mocks.detail } } }),
}))
const wrappers: VueWrapper[] = []
beforeEach(() => {
  vi.resetAllMocks()
  setActivePinia(createPinia())
  mocks.auth.$sessionKey = 'session-one'
  mocks.auth.isAuthenticated = true
  mocks.auth.user.id = 'admin-one'
  mocks.auth.canActivate.mockReturnValue(true)
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.detail.mockResolvedValue(new AuditDto(auditFixture))
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
})
function setup() {
  const id = ref('audit-example')
  const active = ref(true)
  let detail!: ReturnType<typeof useAuditDetail>
  const wrapper = mount(
    defineComponent({
      setup() {
        detail = useAuditDetail(id, active)
        void detail.reload()
        return () => null
      },
    }),
  )
  wrappers.push(wrapper)
  return { id, active, detail, wrapper }
}
describe('audit detail lifecycle', () => {
  it('clears loaded detail when only the session UUID changes', async () => {
    const { detail } = setup()
    await flushPromises()
    expect(detail.record.value).not.toBeNull()
    reactive(mocks.auth).$sessionKey = 'replacement-session'
    expect(detail.record.value).toBeNull()
    expect(detail.error.value).toBeNull()
  })

  it('uses host Suspense for initial load and retry, then clears store detail on close', async () => {
    const response = deferred<AuditDto>()
    const retry = deferred<AuditDto>()
    mocks.detail.mockReturnValueOnce(response.promise).mockReturnValueOnce(retry.promise)
    const wrapper = mountLibrary(ModalHost, { attachTo: document.body })
    wrappers.push(wrapper)
    const modal = useModalStore()
    const store = useAdministrationActivityStore()
    modal.open({})
    expect(modal.getOptions.view).toBeUndefined()
    modal.open({ view: AuditDetailModal, key: 'first', props: { auditId: 'audit-example' } })
    await flushPromises()
    const dialog = () => document.querySelector('[role=dialog]')!
    const loading = () => dialog().querySelector('[role=status]')
    expect(loading()?.textContent).toContain('Loading')
    expect(
      document.getElementById(dialog().getAttribute('aria-labelledby')!)?.textContent,
    ).toContain('Loading')
    expect(store.detail).toBeNull()
    response.reject(new Error('offline'))
    await flushPromises()
    expect(dialog().querySelector('[role=alert]')?.textContent).toContain('Unable to load')
    ;(dialog().querySelector('[role=alert] button') as HTMLButtonElement).click()
    await flushPromises()
    expect(loading()?.textContent).toContain('Loading')
    expect(dialog().querySelector('[role=alert]')).toBeNull()
    expect(modal.getOptions.key).toBe('first')
    expect(modal.getOptions.renderKey).toEqual(expect.any(String))
    retry.resolve(new AuditDto(auditFixture))
    await flushPromises()
    expect(loading()).toBeNull()
    expect(dialog().querySelector('[role=tabpanel]')?.textContent).toContain('Before')
    expect(store.detail?.id).toBe('audit-example')
    modal.close()
    expect(store.detail).toBeNull()
    expect(store.detailError).toBeNull()
  })
  it('ignores rejected stale requests without disturbing the new result', async () => {
    const old = deferred<AuditDto>()
    mocks.detail
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(new AuditDto({ ...auditFixture, id: 'new' }))
    const { id, detail } = setup()
    await flushPromises()
    id.value = 'new'
    await flushPromises()
    old.reject(new Error('old request failed'))
    await flushPromises()
    expect(detail.record.value?.id).toBe('new')
    expect(detail.error.value).toBeNull()
  })
  it('does not restore detail when the modal closes during suspended setup', async () => {
    const response = deferred<AuditDto>()
    mocks.detail.mockReturnValueOnce(response.promise)
    const wrapper = mountLibrary(ModalHost, { attachTo: document.body })
    wrappers.push(wrapper)
    const modal = useModalStore()
    modal.open({ view: AuditDetailModal, key: 'pending', props: { auditId: 'audit-example' } })
    await flushPromises()
    expect(document.querySelector('.modal__loading')).not.toBeNull()
    ;(document.querySelector('.modal__close') as HTMLButtonElement).click()
    response.resolve(new AuditDto(auditFixture))
    await flushPromises()
    expect(useAdministrationActivityStore().detail).toBeNull()
    expect(useAdministrationActivityStore().detailError).toBeNull()
  })
  it('does not start an API call if unmounted while awaiting credentials', async () => {
    const token = deferred<string>()
    mocks.auth.getValidAccessToken.mockReturnValue(token.promise)
    const { wrapper, detail } = setup()
    wrapper.unmount()
    token.resolve('access')
    await flushPromises()
    expect(mocks.detail).not.toHaveBeenCalled()
    expect(detail.record.value).toBeNull()
  })
  it('loads the selected record with bearer authentication', async () => {
    const { detail } = setup()
    await flushPromises()
    expect(mocks.detail).toHaveBeenCalledWith('access', 'audit-example')
    expect(detail.record.value?.id).toBe('audit-example')
  })
  it('does not request details for guests', async () => {
    mocks.auth.isAuthenticated = false
    const { detail } = setup()
    await flushPromises()
    expect(detail.error.value).toBe('unauthorized')
    expect(mocks.auth.getValidAccessToken).not.toHaveBeenCalled()
    expect(mocks.detail).not.toHaveBeenCalled()
  })
  it('maps an Axios failure without a response to a retryable error', async () => {
    mocks.detail.mockRejectedValue({ isAxiosError: true })
    const { detail } = setup()
    await flushPromises()
    expect(detail.error.value).toBe('failed')
  })
  it('clears loaded detail immediately after the account changes', async () => {
    const { detail } = setup()
    await flushPromises()
    expect(detail.record.value).not.toBeNull()
    reactive(mocks.auth).user.id = 'admin-two'
    expect(detail.record.value).toBeNull()
  })
  it.each(['credentials', 'success', 'error'] as const)(
    'discards detail after authorization changes during %s',
    async (phase) => {
      const store = useAdministrationActivityStore()
      const token = deferred<string>()
      const response = deferred<AuditDto>()
      if (phase === 'credentials') mocks.auth.getValidAccessToken.mockReturnValueOnce(token.promise)
      else mocks.detail.mockReturnValueOnce(response.promise)
      const pending = store.loadDetail('audit-example', 'owner')
      await flushPromises()
      mocks.auth.canActivate.mockReturnValue(false)
      if (phase === 'credentials') token.resolve('access')
      else if (phase === 'success') response.resolve(new AuditDto(auditFixture))
      else response.reject(new Error('revoked'))
      await pending
      expect(store.detail).toBeNull()
      expect(store.detailError).toBeNull()
      expect(store.detailOwner).toBeNull()
    },
  )
  it.each(['logout', 'account'] as const)('discards pending detail after %s', async (change) => {
    const store = useAdministrationActivityStore()
    const response = deferred<AuditDto>()
    mocks.detail.mockReturnValueOnce(response.promise)
    const pending = store.loadDetail('audit-example', 'owner')
    await flushPromises()
    if (change === 'logout') mocks.auth.isAuthenticated = false
    else mocks.auth.user.id = 'other-account'
    response.resolve(new AuditDto(auditFixture))
    await pending
    expect(store.detail).toBeNull()
    expect(store.detailError).toBeNull()
  })
  it('keeps the newer owner record when an outgoing scope is disposed', async () => {
    const first = setup()
    await flushPromises()
    const second = setup()
    await flushPromises()
    first.wrapper.unmount()
    expect(second.detail.record.value?.id).toBe('audit-example')
    second.wrapper.unmount()
    expect(useAdministrationActivityStore().detail).toBeNull()
  })
  it('clears table and detail state together when the page is unloaded', async () => {
    const store = useAdministrationActivityStore()
    await store.loadDetail('audit-example', 'owner')
    store.activity = [new AuditDto(auditFixture)]
    store.clear()
    expect(store.activity).toEqual([])
    expect(store.detail).toBeNull()
    expect(store.detailError).toBeNull()
  })
  it.each([
    [404, 'unavailable'],
    [403, 'forbidden'],
    [401, 'unauthorized'],
    [500, 'failed'],
  ])('handles HTTP %s as %s', async (status, error) => {
    mocks.detail.mockRejectedValue({ isAxiosError: true, response: { status } })
    const { detail } = setup()
    await flushPromises()
    expect(detail.error.value).toBe(error)
    expect(detail.record.value).toBeNull()
  })
  it('does not request details without permission', async () => {
    mocks.auth.canActivate.mockReturnValue(false)
    const { detail } = setup()
    await flushPromises()
    expect(detail.error.value).toBe('forbidden')
    expect(mocks.detail).not.toHaveBeenCalled()
  })
  it('retries a failed request', async () => {
    mocks.detail.mockRejectedValueOnce(new Error('offline'))
    const { detail } = setup()
    await flushPromises()
    expect(detail.error.value).toBe('failed')
    await detail.reload()
    expect(detail.error.value).toBeNull()
    expect(detail.record.value?.id).toBe('audit-example')
  })
  it.each(['close', 'unmount'])('discards pending responses on %s', async (action) => {
    const request = deferred<AuditDto>()
    mocks.detail.mockReturnValue(request.promise)
    const { active, detail, wrapper } = setup()
    await flushPromises()
    if (action === 'close') active.value = false
    else wrapper.unmount()
    request.resolve(new AuditDto(auditFixture))
    await flushPromises()
    expect(detail.record.value).toBeNull()
  })
  it('ignores an older request when the selected ID changes', async () => {
    const old = deferred<AuditDto>()
    mocks.detail
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(new AuditDto({ ...auditFixture, id: 'new-audit' }))
    const { id, detail } = setup()
    await flushPromises()
    id.value = 'new-audit'
    await flushPromises()
    old.resolve(new AuditDto(auditFixture))
    await flushPromises()
    expect(detail.record.value?.id).toBe('new-audit')
  })
})
