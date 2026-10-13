import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { AuditDto } from '@/library/models/audit'
import { auditFixture } from '@/shared/api/__tests__/fixtures'
import { useAuditDetail } from './useAuditDetail'

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
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
describe('audit detail lifecycle', () => {
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
