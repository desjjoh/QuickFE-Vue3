import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { deferred, useTestClock } from '@test/support/async'
import { buildUser } from '@test/support/fixtures'
import { JwtResponseDto, CsrfTokenDto } from '@/library/models/token'
import { UserDto } from '@/library/models/user'
import { AuditPermissions, RoleKey } from '@/config/permissions'

const api = vi.hoisted(() => ({ csrf: vi.fn(), refresh: vi.fn() }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({
    security: { csrfToken: api.csrf },
    authentication: { verifyToken: api.refresh },
  }),
}))
type Message = Record<string, unknown>
class Channel {
  static instances: Channel[] = []
  messages: Message[] = []
  listeners = new Set<(event: { data: Message }) => void>()
  constructor() {
    Channel.instances.push(this)
  }
  postMessage(message: Message) {
    this.messages.push(message)
  }
  addEventListener(_type: string, listener: (event: { data: Message }) => void) {
    this.listeners.add(listener)
  }
  removeEventListener(_type: string, listener: (event: { data: Message }) => void) {
    this.listeners.delete(listener)
  }
  emit(message: Message) {
    for (const listener of [...this.listeners])
      listener({ data: { source: 'other-tab', ...message } })
  }
}
let useStore: typeof import('@/shared/stores/auth').useAuthStore
const jwt = (token = 'refreshed', id = 'user-one') => {
  const now = Date.now() / 1000
  return new JwtResponseDto({
    access_token: token,
    iat: now,
    exp: now + 100,
    refresh: now + 200,
    user: { ...buildUser(), id },
  })
}
const channel = () => Channel.instances[0]!
const lock = () =>
  localStorage.setItem(
    'quickfe_auth_refresh_lock',
    JSON.stringify({ owner: 'other-tab', expiresAt: Date.now() + 15000 }),
  )
beforeEach(async () => {
  vi.resetModules()
  vi.resetAllMocks()
  useTestClock()
  Channel.instances = []
  vi.stubGlobal('BroadcastChannel', Channel)
  api.csrf.mockResolvedValue(
    new CsrfTokenDto({ token: 'csrf', iat: Date.now() / 1000, exp: Date.now() / 1000 + 100 }),
  )
  api.refresh.mockResolvedValue(jwt())
  useStore = (await import('@/shared/stores/auth')).useAuthStore
})

describe('authentication expiry, account races and browser coordination', () => {
  it('clears private data on cross-tab account replacement and purge, but not a same-account refresh', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt('first', 'account-A'), { broadcast: false })
    const { useProfileStore } = await import('@/views/profile/stores/profile')
    const profile = useProfileStore()
    profile.errors.feedActivity = 'private account-A context'
    const key = store.$sessionKey
    const first = jwt('refreshed', 'account-A')
    channel().emit({
      type: 'auth:authenticated',
      accessToken: { token: first.access_token, iat: first.iat, exp: first.exp },
      user: first.user.raw,
      refresh: first.refresh,
    })
    expect(profile.errors.feedActivity).toBe('private account-A context')
    expect(store.$sessionKey).toBe(key)
    const other = jwt('other', 'account-B')
    channel().emit({
      type: 'auth:authenticated',
      accessToken: { token: other.access_token, iat: other.iat, exp: other.exp },
      user: other.user.raw,
      refresh: other.refresh,
    })
    expect(profile.errors.feedActivity).toBeNull()
    expect(store.$sessionKey).not.toBe(key)
    profile.errors.feedActivity = 'private account-B context'
    channel().emit({ type: 'auth:purge' })
    expect(profile.errors.feedActivity).toBeNull()
    expect(store.user).toBeNull()
  })
  it.each([0, -1, 'invalid', null])(
    'purges an invalid stored refresh expiry %s without contacting refresh',
    async (expiry) => {
      localStorage.setItem('refresh_expiry', JSON.stringify(expiry))
      const store = useStore(createPinia())
      await store.initialize()
      expect(api.refresh).not.toHaveBeenCalled()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('refresh_expiry')).toBeNull()
    },
  )
  it('treats exact refresh expiry as expired and coalesces initialization while pending', async () => {
    const store = useStore(createPinia())
    localStorage.setItem('refresh_expiry', JSON.stringify(Date.now() / 1000))
    await store.initialize()
    expect(api.refresh).not.toHaveBeenCalled()
    localStorage.setItem('refresh_expiry', JSON.stringify(Date.now() / 1000 + 30))
    const pending = deferred<JwtResponseDto>()
    api.refresh.mockReturnValueOnce(pending.promise)
    const first = store.initialize()
    const second = store.initialize()
    await flushPromises()
    expect(api.refresh).toHaveBeenCalledOnce()
    pending.resolve(jwt())
    await Promise.all([first, second])
    expect(store.isAuthenticated).toBe(true)
  })
  it('recovers initialization after refresh rejection instead of retaining a rejected promise', async () => {
    const store = useStore(createPinia())
    localStorage.setItem('refresh_expiry', JSON.stringify(Date.now() / 1000 + 30))
    api.refresh.mockRejectedValueOnce(new Error('offline'))
    await expect(store.initialize()).rejects.toThrow('offline')
    localStorage.setItem('refresh_expiry', JSON.stringify(Date.now() / 1000 + 30))
    await store.initialize()
    expect(store.isAuthenticated).toBe(true)
  })
  it('reuses valid access across navigation and coalesces refresh at exact access expiry', async () => {
    const store = useStore(createPinia())
    localStorage.setItem('refresh_expiry', JSON.stringify(Date.now() / 1000 + 200))
    await store.initialize()
    await store.initialize()
    await Promise.all([store.initialize(), store.initialize()])
    expect(api.refresh).toHaveBeenCalledOnce()
    expect(store.$access_token?.token).toBe('refreshed')

    vi.setSystemTime(new Date(store.$access_token!.exp * 1000))
    const pending = deferred<JwtResponseDto>()
    api.refresh.mockReturnValueOnce(pending.promise)
    const first = store.initialize()
    const second = store.initialize()
    await flushPromises()
    expect(api.refresh).toHaveBeenCalledTimes(2)
    pending.resolve(jwt('renewed'))
    await Promise.all([first, second])
    await store.initialize()
    expect(api.refresh).toHaveBeenCalledTimes(2)
    expect(store.$access_token?.token).toBe('renewed')
  })
  it('refreshes an access token at exact expiry and rejects a refresh that yields no access token', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt('expired'), { broadcast: false })
    store.$access_token!.exp = Date.now() / 1000
    expect(await store.getValidAccessToken()).toBe('refreshed')
    store.purgeStore({ broadcast: false })
    vi.spyOn(store, 'authenticate').mockImplementation(() => {})
    await expect(store.getValidAccessToken()).rejects.toThrow('Could not retrieve access token')
  })
  it('does not restore a session after logout while refresh is pending', async () => {
    const store = useStore(createPinia())
    const pending = deferred<JwtResponseDto>()
    api.refresh.mockReturnValueOnce(pending.promise)
    const refresh = store.verifyToken()
    await flushPromises()
    store.purgeStore()
    pending.resolve(jwt())
    await expect(refresh).rejects.toThrow('Session changed')
    expect(store.user).toBeNull()
    expect(store.$access_token).toBeNull()
    expect(localStorage.getItem('refresh_expiry')).toBeNull()
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
  })
  it.each(['success', 'failure'])(
    'preserves a newer account after a stale refresh %s',
    async (outcome) => {
      const store = useStore(createPinia())
      const pending = deferred<JwtResponseDto>()
      api.refresh.mockReturnValueOnce(pending.promise)
      const refresh = store.verifyToken()
      await flushPromises()
      store.authenticate(jwt('account-two', 'user-two'))
      if (outcome === 'success') pending.resolve(jwt('account-one', 'user-one'))
      else pending.reject(new Error('old request failed'))
      await expect(refresh).rejects.toThrow()
      expect(store.user?.id).toBe('user-two')
      expect(await store.getValidAccessToken()).toBe('account-two')
    },
  )
  it('discards a pending CSRF result after logout and permits a clean retry', async () => {
    const store = useStore(createPinia())
    const pending = deferred<CsrfTokenDto>()
    api.csrf.mockReturnValueOnce(pending.promise)
    const first = store.getValidCsrfToken()
    store.purgeStore()
    pending.resolve(new CsrfTokenDto({ token: 'old', iat: 0, exp: Date.now() / 1000 + 50 }))
    await expect(first).rejects.toThrow('Session changed')
    expect(store.$csrf_token).toBeNull()
    expect(await store.getValidCsrfToken()).toBe('csrf')
  })
  it.each(['{invalid', '{}', 'null'])('recovers from malformed cross-tab lock %s', async (raw) => {
    localStorage.setItem('quickfe_auth_refresh_lock', raw)
    await useStore(createPinia()).verifyToken()
    expect(api.refresh).toHaveBeenCalledOnce()
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
  })
  it('removes expired locks, recognizes its own lock, and respects purge options', async () => {
    const store = useStore(createPinia())
    localStorage.setItem(
      'quickfe_auth_refresh_lock',
      JSON.stringify({ owner: 'other', expiresAt: Date.now() }),
    )
    await store.verifyToken()
    const source = channel().messages[0]!.source
    localStorage.setItem(
      'quickfe_auth_refresh_lock',
      JSON.stringify({ owner: source, expiresAt: Date.now() + 15000 }),
    )
    await store.verifyToken()
    store.purgeStore({ destroyRefreshExpiry: false, broadcast: false })
    expect(localStorage.getItem('refresh_expiry')).not.toBeNull()
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
  })
  it('hydrates cross-tab authentication, ignores own/incomplete events and reacts to remote logout', async () => {
    const store = useStore(createPinia())
    await store.getValidCsrfToken()
    const source = channel().messages[0]!.source
    channel().emit({ type: 'auth:purge', source })
    expect(store.$csrf_token).not.toBeNull()
    channel().emit({
      type: 'auth:csrf',
      csrfToken: { token: 'remote', exp: Date.now() / 1000 + 5 },
    })
    expect(await store.getValidCsrfToken()).toBe('remote')
    channel().emit({ type: 'auth:authenticated' })
    expect(store.user).toBeNull()
    channel().emit({
      type: 'auth:authenticated',
      accessToken: { token: 'remote-access', exp: Date.now() / 1000 + 5 },
      user: buildUser(),
      refresh: Date.now() / 1000 + 20,
    })
    expect(store.user?.createdAt).toBeInstanceOf(Date)
    const updated = buildUser()
    updated.profile.personal.bio = 'Updated biography'
    store.updateAuthenticatedUser(new UserDto(updated))
    expect(store.user?.id).toBe(updated.id)
    expect(store.user?.profile.personal.bio).toBe('Updated biography')
    channel().emit({ type: 'auth:purge' })
    expect(store.user).toBeNull()
  })
  it('waits for another tab and uses only valid rotated access credentials', async () => {
    const store = useStore(createPinia())
    await store.getValidCsrfToken()
    lock()
    const pending = store.getValidAccessToken()
    await flushPromises()
    channel().emit({ type: 'unrelated' })
    channel().emit({
      type: 'auth:refresh:done',
      success: true,
      source: channel().messages[0]?.source ?? 'unused-own-id',
    })
    channel().emit({
      type: 'auth:authenticated',
      accessToken: { token: 'remote-access', exp: Date.now() / 1000 + 20 },
      user: buildUser(),
    })
    localStorage.removeItem('quickfe_auth_refresh_lock')
    channel().emit({ type: 'auth:refresh:done', success: true })
    expect(await pending).toBe('remote-access')
    expect(api.refresh).not.toHaveBeenCalled()
    expect(channel().listeners.size).toBe(1)
  })
  it.each(['failure', 'timeout'])('cleans its cross-tab waiter on %s', async (outcome) => {
    lock()
    const pending = useStore(createPinia()).verifyToken()
    const rejection = expect(pending).rejects.toThrow(
      outcome === 'timeout' ? 'Timed out' : 'could not refresh',
    )
    if (outcome === 'timeout') await vi.advanceTimersByTimeAsync(15000)
    else channel().emit({ type: 'auth:refresh:done', success: false })
    await rejection
    expect(channel().listeners.size).toBe(1)
    expect(api.refresh).not.toHaveBeenCalled()
  })
  it('does not accept an expired remote token or steal a still-owned remote refresh lock', async () => {
    const store = useStore(createPinia())
    store.$access_token = { token: 'old', iat: 0, exp: 0 }
    lock()
    const pending = store.verifyToken()
    channel().emit({ type: 'auth:refresh:done', success: true })
    await expect(pending).rejects.toThrow('Another tab')
    expect(api.refresh).not.toHaveBeenCalled()
  })
  it('falls back to refreshing after a remote completion that supplied no credentials', async () => {
    lock()
    const store = useStore(createPinia())
    const pending = store.verifyToken()
    localStorage.removeItem('quickfe_auth_refresh_lock')
    channel().emit({ type: 'auth:refresh:done', success: true })
    await pending
    expect(api.refresh).toHaveBeenCalledOnce()
  })
  it('rejects refresh waiting after remote logout', async () => {
    lock()
    const store = useStore(createPinia())
    const pending = store.verifyToken()
    channel().emit({ type: 'auth:purge' })
    channel().emit({ type: 'auth:refresh:done', success: true })
    await expect(pending).rejects.toThrow('Session changed')
  })
  it('works without BroadcastChannel, but refuses to refresh over another tab lock', async () => {
    vi.stubGlobal('BroadcastChannel', undefined)
    const store = useStore(createPinia())
    await store.verifyToken()
    expect(store.isAuthenticated).toBe(true)
    lock()
    await expect(store.verifyToken()).rejects.toThrow('Another tab')
  })
  it('revokes access when updated roles lose permissions and does not grant empty role sets', () => {
    const store = useStore(createPinia())
    store.authenticate(jwt())
    expect(store.hasRequiredRole([])).toBe(false)
    const user = jwt().user
    user.roles.splice(0)
    store.updateAuthenticatedUser(user)
    expect(store.canActivate([AuditPermissions.READ_AUDIT_DETAIL])).toBe(false)
    expect(store.hasRequiredRole([RoleKey.ADMINISTRATOR])).toBe(false)
    store.purgeStore()
    expect(store.hasRequiredRole([RoleKey.ADMINISTRATOR])).toBe(false)
  })
  it('does not restore a logged-out or different account from a late profile response', () => {
    const store = useStore(createPinia())
    const oldUser = jwt().user
    store.updateAuthenticatedUser(oldUser)
    expect(store.isAuthenticated).toBe(false)
    store.authenticate(jwt())
    const other = new UserDto({ ...buildUser(), id: 'different-account' })
    store.updateAuthenticatedUser(other)
    expect(store.user?.id).toBe(oldUser.id)
    store.purgeStore()
    store.updateAuthenticatedUser(oldUser)
    expect(store.user).toBeNull()
  })
})
