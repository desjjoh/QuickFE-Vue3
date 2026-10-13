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
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
  mocks.list.mockResolvedValue([])
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('session store API integration and race handling', () => {
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
