import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { deferred } from '@test/support/async'
import { buildAudit } from '@test/support/fixtures'
import { AuditPageDto } from '@/library/models/audit'
import { useAdministrationActivityStore } from './activity'

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  auth: { isAuthenticated: true, canActivate: vi.fn(), getValidAccessToken: vi.fn() },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ administration: { audits: { search: mocks.search } } }),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
const page = () =>
  new AuditPageDto({
    data: [buildAudit()],
    meta: {
      page: 2,
      take: 10,
      itemCount: 11,
      pageCount: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    },
  })
beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
  mocks.auth.canActivate.mockReturnValue(true)
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.search.mockResolvedValue(page())
})

describe('administration activity state and contracts', () => {
  it('retains typed records and pagination and forwards filters to the adapter', async () => {
    const store = useAdministrationActivityStore()
    const query = { domain: 'identity', page: 2 }
    await store.loadActivity(query)
    expect(mocks.search).toHaveBeenCalledWith('access', query)
    expect(store.pagination.page).toBe(2)
    expect(store.activity[0]?.occurredAt).toBeInstanceOf(Date)
    expect(store.loading).toBe(false)
  })
  it('blocks denied access and clears protected data', async () => {
    const store = useAdministrationActivityStore()
    await store.loadActivity()
    mocks.search.mockClear()
    mocks.auth.canActivate.mockReturnValue(false)
    await store.loadActivity()
    expect(store.activity).toEqual([])
    expect(mocks.search).not.toHaveBeenCalled()
  })
  it('recovers after rejection and ignores old failed requests', async () => {
    const store = useAdministrationActivityStore()
    mocks.search.mockRejectedValueOnce(new Error('offline'))
    await store.loadActivity()
    expect(store.error).toBe('offline')
    expect(store.pagination.page).toBe(1)
    const old = deferred<AuditPageDto>()
    mocks.search.mockReturnValueOnce(old.promise)
    const pending = store.loadActivity()
    await flushPromises()
    await store.loadActivity()
    old.reject(new Error('stale'))
    await pending
    expect(store.error).toBeNull()
    expect(store.pagination.page).toBe(2)
  })
  it('does not retain results after page cleanup', async () => {
    const store = useAdministrationActivityStore()
    const result = deferred<AuditPageDto>()
    mocks.search.mockReturnValue(result.promise)
    const pending = store.loadActivity()
    await flushPromises()
    store.clear()
    result.resolve(page())
    await pending
    expect(store.activity).toEqual([])
    expect(store.loading).toBe(false)
  })
})
