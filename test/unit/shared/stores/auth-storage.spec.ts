import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { JwtResponseDto, CsrfTokenDto } from '@/library/models/token'
import { buildUser } from '@test/support/fixtures'
import { deferred, useTestClock } from '@test/support/async'

const api = vi.hoisted(() => ({ csrf: vi.fn(), refresh: vi.fn() }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({
    security: { csrfToken: api.csrf },
    authentication: { verifyToken: api.refresh },
  }),
}))
type Auth = ReturnType<typeof import('@/shared/stores/auth').useAuthStore>
let useAuth: typeof import('@/shared/stores/auth').useAuthStore
const stores: Auth[] = []
const identityKey = 'quickfe_auth_identity'
const credentials = (id: string) =>
  new JwtResponseDto({
    access_token: id,
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 60,
    refresh: Date.now() / 1000 + 120,
    user: { ...buildUser(), id },
  })
const createStore = () => {
  const store = useAuth(createPinia())
  stores.push(store)
  return store
}
function notify(key: string | null = identityKey, storageArea: Storage = localStorage) {
  window.dispatchEvent(new StorageEvent('storage', { key, storageArea }))
}
function share(userId: string | null) {
  const identity = { key: crypto.randomUUID(), userId }
  localStorage.setItem(identityKey, JSON.stringify(identity))
  notify()
  return identity.key
}
beforeEach(async () => {
  vi.resetModules()
  vi.resetAllMocks()
  useTestClock()
  vi.stubGlobal('BroadcastChannel', undefined)
  api.csrf.mockResolvedValue(
    new CsrfTokenDto({ token: 'csrf', iat: 0, exp: Date.now() / 1000 + 60 }),
  )
  api.refresh.mockResolvedValue(credentials('account-B'))
  useAuth = (await import('@/shared/stores/auth')).useAuthStore
})
afterEach(() => {
  for (const store of stores.splice(0)) store.$dispose()
})

describe('cross-tab identity reconciliation', () => {
  it('recovers when a credential broadcast precedes visibility of the shared storage write', async () => {
    const listeners = new Set<(event: { data: unknown }) => void>()
    const emit = (data: unknown) => {
      for (const listener of [...listeners]) listener({ data })
    }
    vi.stubGlobal(
      'BroadcastChannel',
      class {
        close = vi.fn()
        postMessage = vi.fn()
        addEventListener = (_name: string, callback: (event: { data: unknown }) => void) => {
          listeners.add(callback)
        }
        removeEventListener = (_name: string, callback: (event: { data: unknown }) => void) => {
          listeners.delete(callback)
        }
      },
    )
    const store = createStore()
    store.authenticate(credentials('account-A'))
    const key = crypto.randomUUID()
    const next = credentials('account-B')
    const message = {
      type: 'auth:authenticated',
      source: 'other-tab',
      sessionKey: key,
      user: next.user.raw,
      accessToken: { token: next.access_token, iat: next.iat, exp: next.exp },
    }
    emit(message)
    expect(store.user!.id).toBe('account-A')
    localStorage.setItem(identityKey, JSON.stringify({ key, userId: 'account-B' }))
    notify()
    expect(store.user).toBeNull()
    emit(message)
    await flushPromises()
    expect(api.refresh).not.toHaveBeenCalled()
    expect(store.user!.id).toBe('account-B')
    expect(store.$sessionKey).toBe(key)
  })
  it('handles failed recovery without retaining the previous account or an unhandled rejection', async () => {
    const store = createStore()
    store.authenticate(credentials('account-A'))
    api.refresh.mockRejectedValueOnce(new Error('offline'))
    const key = share('account-B')
    await flushPromises()
    expect(store.user).toBeNull()
    expect(store.$sessionKey).toBe(key)
    expect(JSON.parse(localStorage.getItem(identityKey)!)).toEqual({ key, userId: 'account-B' })
  })
  it('clears the previous account immediately on storage logout without a channel or shared writes', async () => {
    const store = createStore()
    store.authenticate(credentials('account-A'))
    const { useProfileStore } = await import('@/views/profile/stores/profile')
    const profile = useProfileStore()
    profile.errors.feedActivity = 'private A'
    const expiry = localStorage.getItem('refresh_expiry')
    const key = share(null)
    expect(store.isAuthenticated).toBe(false)
    expect(profile.errors.feedActivity).toBeNull()
    expect(store.$sessionKey).toBe(key)
    expect(JSON.parse(localStorage.getItem(identityKey)!)).toEqual({ key, userId: null })
    expect(localStorage.getItem('refresh_expiry')).toBe(expiry)
    expect(api.refresh).not.toHaveBeenCalled()
  })
  it('recovers another account from the cookie after storage changes without a channel', async () => {
    const store = createStore()
    store.authenticate(credentials('account-A'))
    const pending = deferred<JwtResponseDto>()
    api.refresh.mockReturnValueOnce(pending.promise)
    const key = share('account-B')
    expect(store.user).toBeNull()
    expect(store.$sessionKey).toBe(key)
    await flushPromises()
    expect(api.refresh).toHaveBeenCalledOnce()
    pending.resolve(credentials('account-B'))
    await flushPromises()
    expect(store.user!.id).toBe('account-B')
    expect(store.$sessionKey).toBe(key)
  })
  it('does not restore a different cookie account or overwrite the shared identity', async () => {
    const store = createStore()
    store.authenticate(credentials('account-A'))
    api.refresh.mockResolvedValueOnce(credentials('account-A'))
    const key = share('account-B')
    await flushPromises()
    expect(store.user).toBeNull()
    expect(JSON.parse(localStorage.getItem(identityKey)!)).toEqual({ key, userId: 'account-B' })
  })
  it('handles storage.clear and ignores unrelated, sessionStorage and same-identity notifications', () => {
    const store = createStore()
    store.authenticate(credentials('account-A'))
    notify('theme')
    notify(identityKey, sessionStorage)
    notify()
    expect(store.user!.id).toBe('account-A')
    localStorage.clear()
    notify(null)
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem(identityKey)).toBeNull()
  })
  it('does not resurrect an old recovery when a newer logout arrives', async () => {
    const store = createStore()
    store.authenticate(credentials('account-A'))
    const pending = deferred<JwtResponseDto>()
    api.refresh.mockReturnValueOnce(pending.promise)
    share('account-B')
    await flushPromises()
    const key = share(null)
    pending.resolve(credentials('account-B'))
    await flushPromises()
    expect(store.user).toBeNull()
    expect(store.$sessionKey).toBe(key)
  })
  it('retains a newer unpersisted local login when older metadata is announced', () => {
    const store = createStore()
    store.authenticate(credentials('account-A'))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    store.authenticate(credentials('account-B'), { newSession: true })
    notify()
    expect(store.user!.id).toBe('account-B')
  })
  it('unsubscribes storage changes and closes its channel on disposal', () => {
    const close = vi.fn()
    vi.stubGlobal(
      'BroadcastChannel',
      class {
        close = close
        postMessage = vi.fn()
        addEventListener = vi.fn()
      },
    )
    const store = createStore()
    store.authenticate(credentials('account-A'))
    store.$dispose()
    stores.splice(stores.indexOf(store), 1)
    share(null)
    expect(store.user!.id).toBe('account-A')
    expect(close).toHaveBeenCalledOnce()
  })
})
