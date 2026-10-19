import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AuditPageDto, type AuditRecord } from '@/library/models/audit'
import { useProfileStore } from '@/views/profile/stores/profile'
import { deferred as rejectable } from '@test/support/async'
import { flushPromises } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  activity: vi.fn(),
  auth: {
    $sessionKey: 'session-one',
    isAuthenticated: true,
    user: { id: 'user' },
    getValidAccessToken: vi.fn(),
    getValidCsrfToken: vi.fn(),
  },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ account: { activity: mocks.activity } }),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))

function page(id: string, take: number): AuditPageDto {
  const timestamp = '2026-10-12T12:00:00.000Z'
  const record: AuditRecord = {
    id,
    domain: 'identity',
    event: 'identity.sign_in.succeeded',
    actorType: 'user',
    actorId: null,
    actorUser: null,
    subjectType: null,
    subjectId: null,
    resourceType: null,
    resourceId: null,
    occurredAt: timestamp,
    operationId: null,
    requestId: null,
    sessionId: null,
    ipAddress: null,
    ipLocation: {
      ip: null,
      countryCode: null,
      countryName: null,
      regionCode: null,
      regionName: null,
      city: null,
      source: 'unknown',
      resolvedAt: timestamp,
    },
    userAgent: null,
    browser: null,
    browserVersion: null,
    device: null,
    os: null,
    osVersion: null,
    httpMethod: null,
    route: null,
    source: 'http',
    before: null,
    after: null,
    changes: null,
    metadata: null,
    reasonCode: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  return new AuditPageDto({
    data: [record],
    meta: { page: 1, take, itemCount: 1, pageCount: 1, hasPreviousPage: false, hasNextPage: false },
  })
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  mocks.auth.$sessionKey = 'session-one'
  mocks.auth.isAuthenticated = true
  mocks.auth.user.id = 'user'
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
})

describe('profile activity page state', () => {
  it.each(['feedActivity', 'tableActivity'] as const)(
    'recovers %s from current errors and suppresses stale errors',
    async (target) => {
      const log = vi.spyOn(console, 'error').mockImplementation(() => {})
      const store = useProfileStore()
      mocks.activity.mockRejectedValueOnce(new Error('offline'))
      await store.loadActivity(target)
      expect(store.errors[target]).toBeTruthy()
      expect(store[target]).toEqual([])
      expect(store.loading[target]).toBe(false)
      const old = rejectable<AuditPageDto>()
      mocks.activity.mockReturnValueOnce(old.promise).mockResolvedValueOnce(page('recovered', 10))
      const pending = store.loadActivity(target)
      await flushPromises()
      await store.loadActivity(target)
      old.reject(new Error('stale'))
      await pending
      expect(store.errors[target]).toBeNull()
      expect(store[target][0]?.id).toBe('recovered')
      expect(log).toHaveBeenCalledExactlyOnceWith('offline — Reason: offline')
    },
  )
  it.each(['credentials', 'success', 'error'] as const)(
    'discards old account activity at %s',
    async (phase) => {
      const store = useProfileStore()
      const token = rejectable<string>()
      const result = rejectable<AuditPageDto>()
      if (phase === 'credentials') mocks.auth.getValidAccessToken.mockReturnValueOnce(token.promise)
      else mocks.activity.mockReturnValueOnce(result.promise)
      const pending = store.loadActivity('tableActivity')
      await flushPromises()
      mocks.auth.user.id = 'different'
      if (phase === 'credentials') token.resolve('access')
      else if (phase === 'success') result.resolve(page('old-account', 10))
      else result.reject(new Error('old account failure'))
      await pending
      expect(store.tableActivity).toEqual([])
      expect(store.errors.tableActivity).toBeNull()
      expect(store.loading.tableActivity).toBe(false)
      if (phase === 'credentials') expect(mocks.activity).not.toHaveBeenCalled()
    },
  )
  it('does not send a request after cleanup while credentials are pending', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useProfileStore()
    const token = rejectable<string>()
    mocks.auth.getValidAccessToken.mockReturnValueOnce(token.promise)
    const pending = store.loadActivity('feedActivity')
    store.clearActivity('feedActivity')
    token.resolve('access')
    await pending
    expect(mocks.activity).not.toHaveBeenCalled()
    mocks.auth.getValidCsrfToken.mockRejectedValueOnce(new Error('denied'))
    await store.loadActivity('feedActivity')
    expect(store.errors.feedActivity).toBeTruthy()
    expect(log).toHaveBeenCalledExactlyOnceWith('denied — Reason: denied')
  })
  it('loads the table without changing the outgoing feed and cleans each page independently', async () => {
    const profile = useProfileStore()
    const table = deferred<AuditPageDto>()
    mocks.activity.mockResolvedValueOnce(page('feed', 5)).mockReturnValueOnce(table.promise)
    await profile.loadActivity('feedActivity', { page: 1, take: 5 })
    const pending = profile.loadActivity('tableActivity', { page: 1, take: 10 })
    await vi.waitFor(() => expect(mocks.activity).toHaveBeenCalledTimes(2))
    expect(profile.feedActivity[0]?.id).toBe('feed')
    expect(profile.loading.tableActivity).toBe(true)
    table.resolve(page('table', 10))
    await pending
    expect(profile.feedActivity[0]?.id).toBe('feed')
    expect(profile.tableActivity[0]?.id).toBe('table')
    profile.clearActivity('feedActivity')
    expect(profile.feedActivity).toEqual([])
    expect(profile.tableActivity[0]?.id).toBe('table')
    expect(profile.pagination.take).toBe(10)
    profile.clearActivity('tableActivity')
    expect(profile.tableActivity).toEqual([])
    expect(profile.pagination.take).toBe(10)
  })

  it.each(['feedActivity', 'tableActivity'] as const)(
    'ignores late responses after %s is cleared',
    async (target) => {
      const store = useProfileStore()
      const response = deferred<AuditPageDto>()
      mocks.activity.mockReturnValue(response.promise)
      const pending = store.loadActivity(target, { take: 5 })
      await vi.waitFor(() => expect(mocks.activity).toHaveBeenCalledTimes(1))
      store.clearActivity(target)
      response.resolve(page('late', 5))
      await pending
      expect(store[target]).toEqual([])
      expect(store.loading[target]).toBe(false)
    },
  )

  it('prevents an older table response from replacing a newer request or clearing its loading state', async () => {
    const store = useProfileStore()
    const older = deferred<AuditPageDto>()
    const newer = deferred<AuditPageDto>()
    mocks.activity.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise)
    const first = store.loadActivity('tableActivity', { page: 1 })
    await vi.waitFor(() => expect(mocks.activity).toHaveBeenCalledTimes(1))
    const second = store.loadActivity('tableActivity', { page: 2 })
    await vi.waitFor(() => expect(mocks.activity).toHaveBeenCalledTimes(2))
    older.resolve(page('older', 10))
    await first
    expect(store.loading.tableActivity).toBe(true)
    expect(store.tableActivity).toEqual([])
    newer.resolve(page('newer', 10))
    await second
    expect(store.tableActivity[0]?.id).toBe('newer')
    expect(store.loading.tableActivity).toBe(false)
  })

  it('clears both page states when authentication is lost', async () => {
    const store = useProfileStore()
    mocks.activity.mockResolvedValue(page('existing', 10))
    await store.loadActivity('feedActivity')
    await store.loadActivity('tableActivity')
    mocks.auth.isAuthenticated = false
    await store.loadActivity('tableActivity')
    expect(store.feedActivity).toEqual([])
    expect(store.tableActivity).toEqual([])
    expect(store.loading).toEqual({ feedActivity: false, tableActivity: false })
  })
})
