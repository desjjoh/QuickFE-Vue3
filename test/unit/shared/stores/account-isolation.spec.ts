import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia, disposePinia, type Pinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useAuthStore } from '@/shared/stores/auth'
import { useProfileStore } from '@/views/profile/stores/profile'
import { useSettingsStore } from '@/views/settings/stores/settings'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import { useAdministrationActivityStore } from '@/views/administration/stores/activity'
import { useRouteDataStore } from '@/shared/stores/route-data'
import { useLibraryStore } from '@/shared/stores/library'
import { useModalStore } from '@/shared/stores/modal'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useToastStore } from '@/shared/stores/toasts'
import { AuditDto } from '@/library/models/audit'
import { UserAdministrationDto } from '@/library/models/administration'
import { JwtResponseDto } from '@/library/models/token'
import { SessionDto } from '@/library/models/user'
import { CountryDto } from '@/library/models/reference'
import { auditFixture, userFixture } from '@test/support/api-fixtures'
import { deferred } from '@test/support/async'

const api = vi.hoisted(() => ({
  account: { activity: vi.fn() },
  sessions: { list: vi.fn() },
  administration: { users: { getUsers: vi.fn() }, audits: { search: vi.fn(), detail: vi.fn() } },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({ useLocalHostAPI: () => api }))
let pinia: Pinia
function jwt(id = 'account-A') {
  const now = Date.now() / 1000
  return new JwtResponseDto({
    access_token: `token-${id}`,
    iat: now,
    exp: now + 3600,
    refresh: now + 7200,
    user: {
      ...userFixture,
      id,
      roles: [
        { ...userFixture.status, key: 'administrator', permissions: ['has_all_permissions'] },
      ],
    },
  })
}
function seed(id: string) {
  const audit = new AuditDto({ ...auditFixture, id: `audit-${id}`, subjectId: id })
  const profile = useProfileStore()
  profile.feedActivity = [audit]
  profile.tableActivity = [audit]
  useSettingsStore().$sessions = [
    new SessionDto({
      ...auditFixture,
      id: `session-${id}`,
      active: true,
      countryCode: null,
      countryName: null,
      regionCode: null,
      regionName: null,
      city: null,
      locationSource: null,
      locationResolvedAt: null,
      origin: null,
    }),
  ]
  useSettingsStore().$sessionsInitialized = true
  useAdministrationUsersStore().users = [
    new UserAdministrationDto({ ...userFixture, id, version: 1 }),
  ]
  useAdministrationActivityStore().activity = [audit]
  useAdministrationActivityStore().detail = audit
  useModalStore().open({ key: 'private', props: { account: id } })
  useOffcanvas().open({ key: 'private', props: { account: id } })
  useToastStore().addToast({ message: `private-${id}` })
}
function expectEmpty() {
  expect(useProfileStore().feedActivity).toEqual([])
  expect(useProfileStore().tableActivity).toEqual([])
  expect(useSettingsStore().sessions).toEqual([])
  expect(useSettingsStore().areSessionsInitialized).toBe(false)
  expect(useAdministrationUsersStore().users).toEqual([])
  expect(useAdministrationActivityStore().activity).toEqual([])
  expect(useAdministrationActivityStore().detail).toBeNull()
  expect(useModalStore().isOpen).toBe(false)
  expect(useModalStore().getOptions.props).toEqual({})
  expect(useOffcanvas().$isOpen).toBe(false)
  expect(useOffcanvas().$options.props).toEqual({})
  expect(useToastStore().getToasts).toEqual([])
}
beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  vi.stubGlobal('BroadcastChannel', undefined)
  useAuthStore().authenticate(jwt(), { broadcast: false })
  useAuthStore().$csrf_token = { token: 'csrf', iat: 0, exp: Date.now() / 1000 + 3600 }
})
afterEach(() => {
  disposePinia(pinia)
  vi.unstubAllGlobals()
})

describe('account-scoped data isolation', () => {
  it('clears every private store on logout even without mounted pages and preserves public references', async () => {
    const publicLibrary = useLibraryStore()
    publicLibrary.$countries = [new CountryDto(userFixture.profile.region.country)]
    const route = { fullPath: '/profile/account', query: {}, meta: { requiresAuth: true } }
    await useRouteDataStore().prepare(route)
    seed('account-A')
    const session = useAuthStore().$sessionKey
    useAuthStore().purgeStore({ broadcast: false })
    expectEmpty()
    expect(useRouteDataStore().isPrepared(route)).toBe(false)
    expect(useAuthStore().$sessionKey).not.toBe(session)
    expect(publicLibrary.countries).toHaveLength(1)
  })

  it('clears direct account replacements but retains data and request identity during same-account refresh', () => {
    seed('account-A')
    const key = useAuthStore().$sessionKey
    useAuthStore().authenticate(jwt(), { broadcast: false })
    expect(useProfileStore().feedActivity[0]?.subjectId).toBe('account-A')
    expect(useAuthStore().$sessionKey).toBe(key)
    useAuthStore().authenticate(jwt('account-B'), { broadcast: false })
    expectEmpty()
    expect(useAuthStore().$sessionKey).not.toBe(key)
  })

  it.each(['account-A', 'account-B'])(
    'discards all outstanding A responses after logout and sign-in as %s',
    async (id) => {
      const page = deferred<unknown>()
      const sessions = deferred<unknown>()
      const detail = deferred<unknown>()
      api.account.activity.mockReturnValue(page.promise)
      api.administration.users.getUsers.mockReturnValue(page.promise)
      api.administration.audits.search.mockReturnValue(page.promise)
      api.sessions.list.mockReturnValue(sessions.promise)
      api.administration.audits.detail.mockReturnValue(detail.promise)
      const pending = [
        useProfileStore().loadActivity('feedActivity'),
        useProfileStore().loadActivity('tableActivity'),
        useSettingsStore().loadSessions(),
        useAdministrationUsersStore().loadUsers(),
        useAdministrationActivityStore().loadActivity(),
        useAdministrationActivityStore().loadDetail('old', 'old-owner'),
      ]
      await flushPromises()
      useAuthStore().purgeStore({ broadcast: false })
      expectEmpty()
      useAuthStore().authenticate(jwt(id), { broadcast: false })
      seed(id)
      page.resolve({ data: [{ id: 'late-account-A' }], meta: {} })
      sessions.resolve([{ id: 'late-account-A' }])
      detail.resolve({ id: 'late-account-A' })
      await Promise.all(pending)
      expect(useProfileStore().feedActivity[0]?.id).toBe(`audit-${id}`)
      expect(useProfileStore().tableActivity[0]?.id).toBe(`audit-${id}`)
      expect(useSettingsStore().sessions[0]?.id).toBe(`session-${id}`)
      expect(useAdministrationUsersStore().users[0]?.id).toBe(id)
      expect(useAdministrationActivityStore().activity[0]?.id).toBe(`audit-${id}`)
      expect(useAdministrationActivityStore().detail?.id).toBe(`audit-${id}`)
    },
  )
})
