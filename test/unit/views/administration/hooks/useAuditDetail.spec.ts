import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref, h } from 'vue'
import { mountLibrary } from '@test/support/mount'
import AuditDetailModal from '@/views/administration/pages/overview/components/AuditDetailModal.vue'
import { DialogTitleId } from '@/library/components/dialog'
import { useModalStore } from '@/shared/stores/modal'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { AuditDto } from '@/library/models/audit'
import { auditFixture } from '@test/support/api-fixtures'
import { useAuditDetail } from '@/views/administration/hooks/useAuditDetail'
import { deferred } from '@test/support/async'

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  auth: { isAuthenticated: true, canActivate: vi.fn(), getValidAccessToken: vi.fn() },
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ administration: { audits: { detail: mocks.detail } } }),
}))
const wrappers: VueWrapper[] = []
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
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
        return () => null
      },
    }),
  )
  wrappers.push(wrapper)
  return { id, active, detail, wrapper }
}
describe('audit detail lifecycle', () => {
  it('renders the named loading/error detail view and keeps its retry usable', async () => {
    const response = deferred<AuditDto>()
    mocks.detail.mockReturnValueOnce(response.promise)
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          useModalStore().open({})
          return () => h(AuditDetailModal, { auditId: 'audit-example' })
        },
      }),
      { global: { provide: { [DialogTitleId as symbol]: 'audit-heading' } } },
    )
    wrappers.push(wrapper)
    expect(wrapper.get('#audit-heading').text()).toBeTruthy()
    expect(wrapper.get('[role=status]').text()).toContain('Loading')
    response.reject(new Error('offline'))
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Unable to load')
    await wrapper.get('[role=alert] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role=alert]').exists()).toBe(false)
    expect(wrapper.get('[role=tabpanel]').text()).toContain('Before')
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
    expect(detail.loading.value).toBe(false)
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
    expect(detail.loading.value).toBe(false)
  })
  it('loads the selected record with bearer authentication', async () => {
    const { detail } = setup()
    expect(detail.loading.value).toBe(true)
    await flushPromises()
    expect(mocks.detail).toHaveBeenCalledWith('access', 'audit-example')
    expect(detail.record.value?.id).toBe('audit-example')
    expect(detail.loading.value).toBe(false)
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
    expect(detail.loading.value).toBe(false)
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
    expect(detail.loading.value).toBe(false)
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
