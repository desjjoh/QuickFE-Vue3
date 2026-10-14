import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { deferred } from '@test/support/async'
import { useSettingsStore } from './settings'
import type { SessionDto } from '@/library/models/user'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  auth: {
    isAuthenticated: true,
    user: { id: 'user' },
    getValidAccessToken: vi.fn(),
    getValidCsrfToken: vi.fn(),
  },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ sessions: { list: mocks.list } }),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
  mocks.auth.user.id = 'user'
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
  mocks.list.mockResolvedValue([])
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('session store API integration and race handling', () => {
  it('discards rejected old-account requests after logout and supports an absent user identity', async () => {
    const store = useSettingsStore()
    const pendingResult = deferred<SessionDto[]>()
    mocks.list.mockReturnValueOnce(pendingResult.promise)
    const pending = store.loadSessions()
    await flushPromises()
    mocks.auth.isAuthenticated = false
    pendingResult.reject(new Error('old failure'))
    await pending
    expect(store.sessionsError).toBeNull()
    mocks.auth.isAuthenticated = true
    // An authenticated store may be observed before its user DTO is hydrated.
    mocks.auth.user.id = undefined as unknown as string
    await store.loadSessions()
    expect(store.areSessionsInitialized).toBe(true)
    mocks.list.mockRejectedValueOnce(new Error('failure without identity'))
    await store.loadSessions()
    expect(store.sessionsError).toBe('failure without identity')
  })
  it('removes sessions without mutating the supplied list and exposes initial getters', async () => {
    const store = useSettingsStore()
    expect(store.isLoadingSessions).toBe(false)
    expect(store.areSessionsInitialized).toBe(false)
    store.$sessions = [{ id: 'first' }, { id: 'second' }] as SessionDto[]
    const original = store.sessions
    store.removeSession('first')
    expect(store.sessions.map((value) => value.id)).toEqual(['second'])
    expect(original).toHaveLength(2)
  })
  it.each(['logout', 'account'])(
    'ignores protected responses after %s while credentials or data are pending',
    async (mode) => {
      const store = useSettingsStore()
      const credential = deferred<string>()
      mocks.auth.getValidAccessToken.mockReturnValueOnce(credential.promise)
      const waiting = store.loadSessions()
      if (mode === 'logout') mocks.auth.isAuthenticated = false
      else mocks.auth.user.id = 'different'
      credential.resolve('access')
      await waiting
      expect(mocks.list).not.toHaveBeenCalled()
      expect(store.sessions).toEqual([])
      mocks.auth.isAuthenticated = true
      mocks.auth.user.id = 'user'
      const response = deferred<SessionDto[]>()
      mocks.list.mockReturnValueOnce(response.promise)
      const pending = store.loadSessions()
      await flushPromises()
      if (mode === 'logout') mocks.auth.isAuthenticated = false
      else mocks.auth.user.id = 'different'
      response.resolve([{ id: 'old-account-session' }] as SessionDto[])
      await pending
      expect(store.areSessionsInitialized).toBe(false)
      expect(store.isLoadingSessions).toBe(false)
      expect(store.sessions).toEqual([])
    },
  )
  it('suppresses old-account errors and lets the newer overlapping request own loading state', async () => {
    const store = useSettingsStore()
    const old = deferred<SessionDto[]>()
    const newer = deferred<SessionDto[]>()
    mocks.list.mockReturnValueOnce(old.promise).mockReturnValueOnce(newer.promise)
    const first = store.loadSessions()
    await flushPromises()
    const second = store.loadSessions()
    await flushPromises()
    old.resolve([{ id: 'old' }] as SessionDto[])
    await first
    expect(store.isLoadingSessions).toBe(true)
    newer.resolve([])
    await second
    expect(store.isLoadingSessions).toBe(false)
    const failure = deferred<SessionDto[]>()
    mocks.list.mockReturnValueOnce(failure.promise)
    const pending = store.loadSessions()
    await flushPromises()
    mocks.auth.user.id = 'new-account'
    failure.reject(new Error('old account error'))
    await pending
    expect(store.sessionsError).toBeNull()
  })
  it('loads an empty result with credentials, recovers from failure, and clears on logout', async () => {
    const store = useSettingsStore()
    mocks.list.mockRejectedValueOnce(new Error('offline'))
    await store.loadSessions()
    expect(store.sessionsError).toBe('offline')
    expect(store.isLoadingSessions).toBe(false)
    await store.loadSessions()
    expect(store.sessionsError).toBeNull()
    expect(store.areSessionsInitialized).toBe(true)
    expect(mocks.list).toHaveBeenLastCalledWith('access', 'csrf')
    mocks.auth.isAuthenticated = false
    await store.loadSessions()
    expect(store.areSessionsInitialized).toBe(false)
    expect(store.sessions).toEqual([])
  })
  it('ignores late results/errors after cleanup and a newer load', async () => {
    const stale = deferred<SessionDto[]>()
    mocks.list.mockReturnValueOnce(stale.promise)
    const store = useSettingsStore()
    const old = store.loadSessions()
    await flushPromises()
    await store.loadSessions()
    stale.reject(new Error('old failure'))
    await old
    expect(store.sessionsError).toBeNull()
    expect(store.areSessionsInitialized).toBe(true)
    const pending = deferred<SessionDto[]>()
    mocks.list.mockReturnValueOnce(pending.promise)
    const loading = store.loadSessions()
    await flushPromises()
    store.clearSessions()
    pending.resolve([])
    await loading
    expect(store.areSessionsInitialized).toBe(false)
  })
  it('does not request protected data after credential failure or cleanup while awaiting credentials', async () => {
    const store = useSettingsStore()
    mocks.auth.getValidAccessToken.mockRejectedValueOnce(new Error('expired'))
    await store.loadSessions()
    expect(mocks.list).not.toHaveBeenCalled()
    expect(store.sessionsError).toBe('expired')
    const token = deferred<string>()
    mocks.auth.getValidAccessToken.mockReturnValue(token.promise)
    const pending = store.loadSessions()
    store.clearSessions()
    token.resolve('late')
    await pending
    expect(mocks.list).not.toHaveBeenCalled()
  })
})
