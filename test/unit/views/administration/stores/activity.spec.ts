import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { deferred } from '@test/support/async'
import { buildAudit } from '@test/support/fixtures'
import { AuditPageDto } from '@/library/models/audit'
import { useAdministrationActivityStore } from '@/views/administration/stores/activity'

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  auth: {
    isAuthenticated: true,
    user: { id: 'user' },
    canActivate: vi.fn(),
    getValidAccessToken: vi.fn(),
  },
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
  mocks.auth.user.id = 'user'
  mocks.auth.canActivate.mockReturnValue(true)
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.search.mockResolvedValue(page())
})

describe('administration activity state and contracts', () => {
  it.each(['credentials', 'success', 'error'] as const)(
    'discards unauthorized activity at %s',
    async (phase) => {
      const store = useAdministrationActivityStore()
      const token = deferred<string>()
      const result = deferred<AuditPageDto>()
      if (phase === 'credentials') mocks.auth.getValidAccessToken.mockReturnValueOnce(token.promise)
      else mocks.search.mockReturnValueOnce(result.promise)
      const pending = store.loadActivity()
      await flushPromises()
      mocks.auth.canActivate.mockReturnValue(false)
      if (phase === 'credentials') token.resolve('access')
      else if (phase === 'success') result.resolve(page())
      else result.reject(new Error('denied'))
      await pending
      expect(store.activity).toEqual([])
      expect(store.error).toBeNull()
      expect(store.loading).toBe(false)
      if (phase === 'credentials') expect(mocks.search).not.toHaveBeenCalled()
    },
  )
  it('blocks guests, account switches and late credentials after cleanup', async () => {
    const store = useAdministrationActivityStore()
    mocks.auth.isAuthenticated = false
    await store.loadActivity()
    expect(mocks.search).not.toHaveBeenCalled()
    mocks.auth.isAuthenticated = true
    const token = deferred<string>()
    mocks.auth.getValidAccessToken.mockReturnValueOnce(token.promise)
    const pending = store.loadActivity()
    store.clear()
    token.resolve('access')
    await pending
    expect(mocks.search).not.toHaveBeenCalled()
    mocks.search.mockImplementationOnce(async () => {
      mocks.auth.user.id = 'different'
      return page()
    })
    await store.loadActivity()
    expect(store.activity).toEqual([])
  })
  it('retains newer loading state after stale success and reports unknown failures safely', async () => {
    const store = useAdministrationActivityStore()
    const old = deferred<AuditPageDto>()
    const newer = deferred<AuditPageDto>()
    mocks.search.mockReturnValueOnce(old.promise).mockReturnValueOnce(newer.promise)
    const first = store.loadActivity()
    await flushPromises()
    const second = store.loadActivity()
    await flushPromises()
    old.resolve(page())
    await first
    expect(store.loading).toBe(true)
    newer.reject(null)
    await second
    expect(store.error).toBeTruthy()
    expect(store.loading).toBe(false)
  })
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
