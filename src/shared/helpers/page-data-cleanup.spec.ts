import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import { useAdministrationActivityStore } from '@/views/administration/stores/activity'
import { useSettingsStore } from '@/views/settings/stores/settings'

const mocks = vi.hoisted(() => ({
  users: vi.fn(),
  audits: vi.fn(),
  sessions: vi.fn(),
  auth: {
    isAuthenticated: true,
    user: { id: 'user' },
    canActivate: vi.fn(),
    getValidAccessToken: vi.fn(),
    getValidCsrfToken: vi.fn(),
  },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({
    administration: { users: { getUsers: mocks.users }, audits: { search: mocks.audits } },
    sessions: { list: mocks.sessions },
  }),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))

const meta = {
  page: 1,
  take: 10,
  itemCount: 1,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
}
const cases = [
  {
    name: 'user management',
    request: mocks.users,
    result: { data: [{ id: 'result' }], meta },
    create: () => {
      const store = useAdministrationUsersStore()
      return {
        load: () => store.loadUsers(),
        clear: () => store.clear(),
        rows: () => store.users,
        loading: () => store.loading,
      }
    },
  },
  {
    name: 'platform activity',
    request: mocks.audits,
    result: { data: [{ id: 'result' }], meta },
    create: () => {
      const store = useAdministrationActivityStore()
      return {
        load: () => store.loadActivity(),
        clear: () => store.clear(),
        rows: () => store.activity,
        loading: () => store.loading,
      }
    },
  },
  {
    name: 'session settings',
    request: mocks.sessions,
    result: [{ id: 'result' }],
    create: () => {
      const store = useSettingsStore()
      return {
        load: () => store.loadSessions(),
        clear: () => store.reset(),
        rows: () => store.sessions,
        loading: () => store.isLoadingSessions,
      }
    },
  },
]

function deferred() {
  let resolve!: (value: unknown) => void
  let reject!: (reason: Error) => void
  const promise = new Promise((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
  mocks.auth.canActivate.mockReturnValue(true)
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
})

describe.each(cases)('$name page-owned state', ({ create, request, result }) => {
  it('releases loaded rows and loading state on cleanup', async () => {
    const page = create()
    request.mockResolvedValue(result)
    await page.load()
    expect(page.rows()).toHaveLength(1)
    page.clear()
    expect(page.rows()).toEqual([])
    expect(page.loading()).toBe(false)
  })

  it('ignores a response that finishes after the page has cleared', async () => {
    const page = create()
    const response = deferred()
    request.mockReturnValue(response.promise)
    const pending = page.load()
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1))
    page.clear()
    response.resolve(result)
    await pending
    expect(page.rows()).toEqual([])
    expect(page.loading()).toBe(false)
  })

  it('does not let an old failure erase a new page visit or reset its loading flag', async () => {
    const page = create()
    const older = deferred()
    const newer = deferred()
    request.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise)
    const first = page.load()
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1))
    page.clear()
    const second = page.load()
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    older.reject(new Error('Old request failed'))
    await first
    expect(page.loading()).toBe(true)
    newer.resolve(result)
    await second
    expect(page.rows()).toHaveLength(1)
    expect(page.loading()).toBe(false)
  })
})
