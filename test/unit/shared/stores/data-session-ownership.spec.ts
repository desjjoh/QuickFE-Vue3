import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { deferred } from '@test/support/async'
import { buildAudit, buildUser } from '@test/support/fixtures'
import { AuditDto } from '@/library/models/audit'
import { SessionDto } from '@/library/models/user'
import { UserAdministrationDto } from '@/library/models/administration'
import { useProfileStore } from '@/views/profile/stores/profile'
import { useSettingsStore } from '@/views/settings/stores/settings'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import { useAdministrationActivityStore } from '@/views/administration/stores/activity'

const mocks = vi.hoisted(() => ({
  activity: vi.fn(),
  sessions: vi.fn(),
  users: vi.fn(),
  search: vi.fn(),
  detail: vi.fn(),
  auth: {
    $sessionKey: 'session-A',
    isAuthenticated: true,
    user: { id: 'user' },
    canActivate: vi.fn(),
    getValidAccessToken: vi.fn(),
    getValidCsrfToken: vi.fn(),
  },
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({
    account: { activity: mocks.activity },
    sessions: { list: mocks.sessions },
    administration: {
      users: { getUsers: mocks.users },
      audits: { search: mocks.search, detail: mocks.detail },
    },
  }),
}))

const names = [
  'profile feed',
  'profile table',
  'account sessions',
  'administration users',
  'administration activity',
  'audit detail',
] as const
function dataset(name: (typeof names)[number]) {
  const profile = useProfileStore(),
    settings = useSettingsStore(),
    users = useAdministrationUsersStore(),
    activity = useAdministrationActivityStore()
  const page = (record: { id: string }) => ({
    data: [record],
    meta: {
      page: 2,
      take: 10,
      itemCount: 11,
      pageCount: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    },
  })
  const audit = (id: string) => new AuditDto(buildAudit({ id }))
  const session = (id: string) =>
    new SessionDto({
      ...buildAudit({ id }),
      active: true,
      countryCode: null,
      countryName: null,
      regionCode: null,
      regionName: null,
      city: null,
      locationSource: null,
      locationResolvedAt: null,
      origin: null,
    })
  const cases = {
    'profile feed': {
      api: mocks.activity,
      load: () => profile.loadActivity('feedActivity'),
      ids: () => profile.feedActivity.map((row) => row.id),
      error: () => profile.errors.feedActivity,
      loading: () => profile.loading.feedActivity,
      response: (id: string) => page(audit(id)),
    },
    'profile table': {
      api: mocks.activity,
      load: () => profile.loadActivity('tableActivity'),
      ids: () => profile.tableActivity.map((row) => row.id),
      error: () => profile.errors.tableActivity,
      loading: () => profile.loading.tableActivity,
      response: (id: string) => page(audit(id)),
    },
    'account sessions': {
      api: mocks.sessions,
      load: () => settings.loadSessions(),
      ids: () => settings.sessions.map((row) => row.id),
      error: () => settings.sessionsError,
      loading: () => settings.isLoadingSessions,
      response: (id: string) => [session(id)],
    },
    'administration users': {
      api: mocks.users,
      load: () => users.loadUsers(),
      ids: () => users.users.map((row) => row.id),
      error: () => users.error,
      loading: () => users.loading,
      response: (id: string) =>
        page(new UserAdministrationDto({ ...buildUser({ id }), version: 1 })),
    },
    'administration activity': {
      api: mocks.search,
      load: () => activity.loadActivity(),
      ids: () => activity.activity.map((row) => row.id),
      error: () => activity.error,
      loading: () => activity.loading,
      response: (id: string) => page(audit(id)),
    },
    'audit detail': {
      api: mocks.detail,
      load: () => activity.loadDetail('record', 'modal-owner'),
      ids: () => (activity.detail ? [activity.detail.id] : []),
      error: () => activity.detailError,
      loading: () => false,
      response: (id: string) => audit(id),
    },
  }
  return cases[name]
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
  mocks.auth.user = { id: 'user' }
  mocks.auth.$sessionKey = 'session-A'
  mocks.auth.canActivate.mockReturnValue(true)
  mocks.auth.getValidAccessToken.mockResolvedValue('access-A')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
})

describe.each(names)('%s independently owns its session', (name) => {
  for (const change of ['same-account-new-session', 'other-account'] as const) {
    it.each([
      'credentials-success',
      'credentials-failure',
      'response-success',
      'response-failure',
    ] as const)(
      `rejects obsolete %s after ${change} without relying on global cleanup`,
      async (phase) => {
        const data = dataset(name)
        const wait = deferred<unknown>()
        const credentials = phase.startsWith('credentials')
        if (credentials) mocks.auth.getValidAccessToken.mockReturnValueOnce(wait.promise)
        else data.api.mockReturnValueOnce(wait.promise)
        const pending = data.load()
        await flushPromises()
        if (!credentials) expect(data.api).toHaveBeenCalledOnce()
        // No purgeStore, clearAccountData, or store.clear call: the loader must enforce ownership itself.
        if (change === 'same-account-new-session') mocks.auth.$sessionKey = 'session-B'
        else mocks.auth.user = { id: 'other' }
        if (phase.endsWith('failure')) wait.reject(new Error('private old-session failure'))
        else wait.resolve(credentials ? 'access-B' : data.response('old'))
        await pending
        expect(data.ids()).toEqual([])
        expect(data.error()).toBeNull()
        expect(data.loading()).toBe(false)
        if (credentials) expect(data.api).not.toHaveBeenCalled()
        data.api.mockResolvedValueOnce(data.response('recovered'))
        await data.load()
        expect(data.ids()).toEqual(['recovered'])
      },
    )
  }
  it.each(['success', 'failure'] as const)(
    'preserves newer data when an older session settles with %s',
    async (outcome) => {
      const data = dataset(name)
      const wait = deferred<unknown>()
      data.api.mockReturnValueOnce(wait.promise)
      const pending = data.load()
      await flushPromises()
      mocks.auth.$sessionKey = 'session-B'
      data.api.mockResolvedValueOnce(data.response('new-session'))
      await data.load()
      if (outcome === 'success') wait.resolve(data.response('old-session'))
      else wait.reject(new Error('old private failure'))
      await pending
      expect(data.ids()).toEqual(['new-session'])
      expect(data.error()).toBeNull()
      expect(data.loading()).toBe(false)
    },
  )
  it('permits token refresh within the existing session', async () => {
    const data = dataset(name)
    const wait = deferred<unknown>()
    data.api.mockReturnValueOnce(wait.promise)
    const pending = data.load()
    await flushPromises()
    mocks.auth.user = { id: 'user' }
    mocks.auth.getValidAccessToken.mockResolvedValue('rotated-access')
    wait.resolve(data.response('same-session'))
    await pending
    expect(data.ids()).toEqual(['same-session'])
    expect(data.error()).toBeNull()
  })
  it('refuses private work without a hydrated user ID', async () => {
    mocks.auth.user.id = ''
    const data = dataset(name)
    await data.load()
    expect(data.api).not.toHaveBeenCalled()
    expect(mocks.auth.getValidAccessToken).not.toHaveBeenCalled()
    expect(data.ids()).toEqual([])
  })
})

describe('administration failure authorization', () => {
  it.each(['administration users', 'administration activity', 'audit detail'] as const)(
    '%s discards a failure after its permission is revoked',
    async (name) => {
      const data = dataset(name)
      const wait = deferred<unknown>()
      data.api.mockReturnValueOnce(wait.promise)
      const pending = data.load()
      await flushPromises()
      mocks.auth.canActivate.mockReturnValue(false)
      wait.reject(new Error('private server error'))
      await pending
      expect(data.error()).toBeNull()
      expect(data.ids()).toEqual([])
    },
  )
})
