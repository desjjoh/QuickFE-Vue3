import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AuditPageDto, type AuditRecord } from '@/library/models/audit'
import { useProfileStore } from './profile'

const mocks = vi.hoisted(() => ({
  activity: vi.fn(),
  auth: { isAuthenticated: true, getValidAccessToken: vi.fn(), getValidCsrfToken: vi.fn() },
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
  mocks.auth.isAuthenticated = true
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
})

describe('profile activity navigation state', () => {
  it('loads the destination without altering the outgoing data and cleans only the departing page', async () => {
    const store = useProfileStore()
    const table = deferred<AuditPageDto>()
    mocks.activity.mockResolvedValueOnce(page('feed', 5)).mockReturnValueOnce(table.promise)
    await store.loadActivity('feedActivity', { page: 1, take: 5 })
    const pending = store.loadActivity('tableActivity', { page: 1, take: 10 })
    await vi.waitFor(() => expect(mocks.activity).toHaveBeenCalledTimes(2))
    expect(store.feedActivity[0]?.id).toBe('feed')
    expect(store.loading.tableActivity).toBe(true)
    table.resolve(page('table', 10))
    await pending
    expect(store.feedActivity[0]?.id).toBe('feed')
    expect(store.tableActivity[0]?.id).toBe('table')
    store.clearActivity('feedActivity')
    expect(store.feedActivity).toEqual([])
    expect(store.tableActivity[0]?.id).toBe('table')
    expect(store.pagination.take).toBe(10)
    store.clearActivity('tableActivity')
    expect(store.tableActivity).toEqual([])
  })

  it('does not repopulate a page cleared while its request was in flight', async () => {
    const store = useProfileStore()
    const response = deferred<AuditPageDto>()
    mocks.activity.mockReturnValue(response.promise)
    const pending = store.loadActivity('feedActivity', { take: 5 })
    await vi.waitFor(() => expect(mocks.activity).toHaveBeenCalledTimes(1))
    store.clearActivity('feedActivity')
    response.resolve(page('late', 5))
    await pending
    expect(store.feedActivity).toEqual([])
    expect(store.loading.feedActivity).toBe(false)
  })

  it('prevents an older table request from replacing a newer page or clearing its loading state', async () => {
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
})
