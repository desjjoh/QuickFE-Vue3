import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { deferred, useTestClock } from '@test/support/async'
import { buildUser } from '@test/support/fixtures'
import { JwtResponseDto, CsrfTokenDto } from '@/library/models/token'
import { UserDto } from '@/library/models/user'
import { AuditPermissions, RoleKey } from '@/config/permissions'

const api = vi.hoisted(() => ({ csrf: vi.fn(), refresh: vi.fn(), deletePhone: vi.fn() }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({
    security: { csrfToken: api.csrf },
    authentication: { verifyToken: api.refresh },
    account: { profile: { deletePhone: api.deletePhone } },
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
    const identity = JSON.parse(localStorage.getItem('quickfe_auth_identity') ?? 'null')
    const user = message.user as { id: string } | undefined
    const source = this.messages[0]?.source
    if ((!message.source || message.source !== source) && !message.sessionKey) {
      let key = identity?.key
      if (
        message.type === 'auth:purge' ||
        (user && identity?.userId && user.id !== identity.userId)
      )
        key = crypto.randomUUID()
      key ??= crypto.randomUUID()
      message = { sessionKey: key, ...message }
      if (message.type === 'auth:purge' || (message.type === 'auth:authenticated' && user)) {
        localStorage.setItem(
          'quickfe_auth_identity',
          JSON.stringify({ key, userId: user?.id ?? null }),
        )
      }
    }
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
  it.each(['other-account', 'same-account-new-session'])(
    'rejects an authenticated credential waiter after cross-tab %s',
    async (change) => {
      const store = useStore(createPinia())
      store.authenticate(jwt('A', 'account-A'), { broadcast: false })
      store.$access_token!.exp = 0
      lock()
      const pending = store.getValidAccessToken()
      const assertion = expect(pending).rejects.toThrow('Session changed')
      channel().emit({ type: 'auth:purge' })
      const next = jwt('replacement', change === 'other-account' ? 'account-B' : 'account-A')
      channel().emit({
        type: 'auth:authenticated',
        accessToken: { token: next.access_token, iat: next.iat, exp: next.exp },
        user: next.user.raw,
        refresh: next.refresh,
      })
      channel().emit({ type: 'auth:refresh:done', success: true })
      await assertion
      expect(store.$access_token!.token).toBe('replacement')
      expect(store.user!.id).toBe(next.user.id)
    },
  )
  it('permits a same-account cross-tab token refresh without changing action ownership', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt('A', 'account-A'), { broadcast: false })
    const key = store.$sessionKey
    store.$access_token!.exp = 0
    lock()
    const pending = store.getValidAccessToken()
    const next = jwt('rotated', 'account-A')
    channel().emit({
      type: 'auth:authenticated',
      accessToken: { token: next.access_token, iat: next.iat, exp: next.exp },
      user: next.user.raw,
      refresh: next.refresh,
    })
    channel().emit({ type: 'auth:refresh:done', success: true })
    expect(await pending).toBe('rotated')
    expect(store.$sessionKey).toBe(key)
  })
  // This integration case cold-loads the real form/component graph under coverage instrumentation.
  it('stops an actual pending delete-phone action before it can use a replacement account token', async () => {
    const store = useStore(createPinia())
    const { useModalStore } = await import('@/shared/stores/modal')
    const { useSettingsActions } = await import('@/views/settings/hooks/useProfileActions')
    store.authenticate(jwt('A', 'account-A'), { broadcast: false })
    await store.getValidCsrfToken()
    store.$access_token!.exp = 0
    lock()
    await useSettingsActions((k) => k).deletePhone()
    const submit = useModalStore().getOptions.props!.callbackSubmit as () => Promise<void>
    const pending = submit()
    await flushPromises()
    channel().emit({ type: 'auth:purge' })
    const next = jwt('B', 'account-B')
    channel().emit({
      type: 'auth:authenticated',
      accessToken: { token: next.access_token, iat: next.iat, exp: next.exp },
      user: next.user.raw,
      refresh: next.refresh,
    })
    channel().emit({ type: 'auth:refresh:done', success: true })
    await pending
    expect(api.deletePhone).not.toHaveBeenCalled()
    expect(store.user!.id).toBe('account-B')
    const { useToastStore } = await import('@/shared/stores/toasts')
    expect(useToastStore().getToasts).toHaveLength(0)
  }, 15000)
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
  it.each(['success', 'failure'])(
    'does not share old refresh or initialization work, or release a newer lock, after old %s',
    async (outcome) => {
      const store = useStore(createPinia())
      store.authenticate(jwt('A', 'account-A'))
      store.$access_token!.exp = 0
      const old = deferred<JwtResponseDto>()
      const fresh = deferred<JwtResponseDto>()
      api.refresh.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise)
      const first = store.initialize()
      const rejected = expect(first).rejects.toThrow('Session changed')
      await flushPromises()
      store.authenticate(jwt('B', 'account-B'), { newSession: true })
      store.$access_token!.exp = 0
      const second = store.initialize()
      await flushPromises()
      expect(api.refresh).toHaveBeenCalledTimes(2)
      const ownedLock = localStorage.getItem('quickfe_auth_refresh_lock')
      if (outcome === 'success') old.resolve(jwt('late-A', 'account-A'))
      else old.reject(new Error('old denial'))
      await rejected
      expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBe(ownedLock)
      const third = store.initialize()
      const fourth = store.verifyToken()
      await flushPromises()
      expect(api.refresh).toHaveBeenCalledTimes(2)
      fresh.resolve(jwt('fresh-B', 'account-B'))
      await Promise.all([second, third, fourth])
      expect(store.user!.id).toBe('account-B')
      expect(store.$access_token!.token).toBe('fresh-B')
      expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
    },
  )
  it.each(['success', 'failure'])(
    'does not share or clear newer CSRF work after old %s',
    async (outcome) => {
      const store = useStore(createPinia())
      const old = deferred<CsrfTokenDto>()
      const fresh = deferred<CsrfTokenDto>()
      api.csrf.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise)
      const first = store.getValidCsrfToken()
      const rejected = expect(first).rejects.toThrow()
      store.purgeStore()
      const second = store.getValidCsrfToken()
      if (outcome === 'success')
        old.resolve(new CsrfTokenDto({ token: 'old', iat: 0, exp: Date.now() / 1000 + 10 }))
      else old.reject(new Error('old failure'))
      await rejected
      const third = store.getValidCsrfToken()
      expect(api.csrf).toHaveBeenCalledTimes(2)
      fresh.resolve(new CsrfTokenDto({ token: 'new', iat: 0, exp: Date.now() / 1000 + 10 }))
      expect(await Promise.all([second, third])).toEqual(['new', 'new'])
    },
  )
  it.each(['success', 'failure'] as const)(
    'preserves a third refresh when the oldest request finishes with %s after a newer refresh completed',
    async (outcome) => {
      const store = useStore(createPinia())
      store.authenticate(jwt('A', 'account-A'))
      const oldest = deferred<JwtResponseDto>()
      const latest = deferred<JwtResponseDto>()
      api.refresh
        .mockReturnValueOnce(oldest.promise)
        .mockResolvedValueOnce(jwt('B-first-refresh', 'account-B'))
        .mockReturnValueOnce(latest.promise)
      const first = store.verifyToken()
      const rejected = expect(first).rejects.toThrow('Session changed')
      await flushPromises()
      store.authenticate(jwt('B-login', 'account-B'), { newSession: true })
      await store.verifyToken()
      expect(store.$access_token!.token).toBe('B-first-refresh')
      const third = store.verifyToken()
      await flushPromises()
      const lock = localStorage.getItem('quickfe_auth_refresh_lock')
      if (outcome === 'success') oldest.resolve(jwt('obsolete-A', 'account-A'))
      else oldest.reject(new Error('obsolete-A failure'))
      await rejected
      expect(store.$access_token!.token).toBe('B-first-refresh')
      expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBe(lock)
      const duplicate = store.verifyToken()
      await flushPromises()
      expect(api.refresh).toHaveBeenCalledTimes(3)
      latest.resolve(jwt('B-final-refresh', 'account-B'))
      await Promise.all([third, duplicate])
      expect(store.$access_token!.token).toBe('B-final-refresh')
      expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
    },
  )
  it.each(['success', 'failure'] as const)(
    'does not share refresh work across same-account re-login after old %s',
    async (outcome) => {
      const store = useStore(createPinia())
      store.authenticate(jwt('first-login'))
      const old = deferred<JwtResponseDto>()
      const current = deferred<JwtResponseDto>()
      api.refresh.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
      const first = store.verifyToken()
      const rejected = expect(first).rejects.toThrow('Session changed')
      await flushPromises()
      const originalKey = store.$sessionKey
      store.authenticate(jwt('second-login'), { newSession: true })
      const key = store.$sessionKey
      expect(key).not.toBe(originalKey)
      const second = store.verifyToken()
      await flushPromises()
      const lock = localStorage.getItem('quickfe_auth_refresh_lock')
      if (outcome === 'success') old.resolve(jwt('obsolete-refresh'))
      else old.reject(new Error('obsolete-refresh failure'))
      await rejected
      expect(store.$sessionKey).toBe(key)
      expect(store.$access_token!.token).toBe('second-login')
      expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBe(lock)
      current.resolve(jwt('current-refresh'))
      await second
      expect(store.$sessionKey).toBe(key)
      expect(store.$access_token!.token).toBe('current-refresh')
    },
  )
  it('recovers after a refreshing tab disappears, without accepting its delayed completion', async () => {
    const store = useStore(createPinia())
    await store.getValidCsrfToken()
    const sessionKey = store.$sessionKey
    localStorage.setItem(
      'quickfe_auth_refresh_lock',
      JSON.stringify({
        owner: 'closed-tab',
        sessionKey,
        operationId: 'expired-operation',
        expiresAt: Date.now() + 15000,
      }),
    )
    const waiting = store.verifyToken()
    const rejected = expect(waiting).rejects.toThrow('Timed out')
    await vi.advanceTimersByTimeAsync(15000)
    await rejected
    expect(channel().listeners.size).toBe(1)
    const current = deferred<JwtResponseDto>()
    api.refresh.mockReturnValueOnce(current.promise)
    const retried = store.verifyToken()
    await flushPromises()
    const lock = localStorage.getItem('quickfe_auth_refresh_lock')
    channel().emit({
      type: 'auth:refresh:done',
      source: 'closed-tab',
      sessionKey,
      operationId: 'expired-operation',
      success: false,
    })
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBe(lock)
    current.resolve(jwt('recovered'))
    await retried
    expect(store.$access_token!.token).toBe('recovered')
    expect(channel().listeners.size).toBe(1)
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
  })
  it('rotates same-account explicit login identity but preserves ordinary refresh identity', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt())
    const first = store.$sessionKey
    await store.verifyToken()
    expect(store.$sessionKey).toBe(first)
    store.authenticate(jwt(), { newSession: true })
    expect(store.$sessionKey).not.toBe(first)
  })
  it('rejects stale tagged broadcasts and credentials before a newer cross-tab event arrives', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt('A', 'account-A'))
    const key = store.$sessionKey
    const next = crypto.randomUUID()
    localStorage.setItem(
      'quickfe_auth_identity',
      JSON.stringify({ key: next, userId: 'account-B' }),
    )
    channel().emit({ type: 'auth:purge', sessionKey: key })
    channel().emit({ type: 'auth:csrf', sessionKey: key, csrfToken: { token: 'stale' } })
    channel().emit({
      type: 'auth:authenticated',
      sessionKey: key,
      user: jwt().user.raw,
      accessToken: { token: 'stale' },
    })
    expect(store.user!.id).toBe('account-A')
    await expect(store.getValidAccessToken()).rejects.toThrow('Session changed')
    await expect(store.getValidCsrfToken()).rejects.toThrow('Session changed')
    await expect(store.initialize()).rejects.toThrow('Session changed')
    await expect(store.verifyToken()).rejects.toThrow('Session changed')
    expect(api.refresh).not.toHaveBeenCalled()
  })
  it('correlates refresh completion with the lock owner and operation', async () => {
    const store = useStore(createPinia())
    await store.getValidCsrfToken()
    const sessionKey = store.$sessionKey
    localStorage.setItem(
      'quickfe_auth_refresh_lock',
      JSON.stringify({
        owner: 'other-tab',
        operationId: 'new-operation',
        sessionKey,
        expiresAt: Date.now() + 15000,
      }),
    )
    const pending = store.verifyToken()
    channel().emit({
      type: 'auth:refresh:done',
      sessionKey,
      operationId: 'old-operation',
      success: true,
    })
    channel().emit({
      type: 'auth:refresh:done',
      source: 'unrelated-tab',
      sessionKey,
      operationId: 'new-operation',
      success: true,
    })
    await flushPromises()
    expect(channel().listeners.size).toBe(2)
    localStorage.removeItem('quickfe_auth_refresh_lock')
    channel().emit({
      type: 'auth:refresh:done',
      sessionKey,
      operationId: 'new-operation',
      success: true,
    })
    await pending
    expect(channel().listeners.size).toBe(1)
  })
  it.each(['{invalid', '{}', 'null'])('replaces malformed identity metadata %s', async (raw) => {
    localStorage.setItem('quickfe_auth_identity', raw)
    const store = useStore(createPinia())
    await store.getValidCsrfToken()
    expect(JSON.parse(localStorage.getItem('quickfe_auth_identity')!).key).toBe(store.$sessionKey)
  })
  it('shares the current refresh identity with an anonymously bootstrapping tab', async () => {
    const first = useStore(createPinia())
    first.authenticate(jwt())
    const next = useStore(createPinia())
    expect(next.$sessionKey).toBe(first.$sessionKey)
    const recovering = next.verifyToken()
    await vi.advanceTimersByTimeAsync(250)
    await recovering
    expect(next.$sessionKey).toBe(first.$sessionKey)
    expect(next.user!.id).toBe(first.user!.id)
  })
  it('does not clear a new initialization slot when an old cached-token initialization completes', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt('A', 'account-A'))
    const old = store.initialize()
    store.authenticate(jwt('B', 'account-B'))
    store.$access_token!.exp = 0
    const response = deferred<JwtResponseDto>()
    api.refresh.mockReturnValueOnce(response.promise)
    const pending = store.initialize()
    await old
    const duplicate = store.initialize()
    await flushPromises()
    expect(api.refresh).toHaveBeenCalledOnce()
    response.resolve(jwt('new-B', 'account-B'))
    await Promise.all([pending, duplicate])
  })
  it('discards CSRF work superseded by a same-session credential update', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt())
    const response = deferred<CsrfTokenDto>()
    api.csrf.mockReturnValueOnce(response.promise)
    const pending = store.getValidCsrfToken()
    const rejection = expect(pending).rejects.toThrow('Session changed')
    store.authenticate(jwt('rotated'))
    expect(await store.getValidCsrfToken()).toBe('csrf')
    response.resolve(new CsrfTokenDto({ token: 'old', exp: Date.now() / 1000 + 100, iat: 0 }))
    await rejection
    expect(store.$csrf_token!.token).toBe('csrf')
  })
  it.each(['valid', 'expired', 'missing', 'rejection'])(
    'preserves newer same-session credentials when an older refresh completes with %s credentials',
    async (kind) => {
      const store = useStore(createPinia())
      store.authenticate(jwt())
      const response = deferred<JwtResponseDto>()
      api.refresh.mockReturnValueOnce(response.promise)
      const pending = store.verifyToken()
      await flushPromises()
      const next = jwt('newer')
      channel().emit({
        type: 'auth:authenticated',
        user: next.user.raw,
        accessToken: { token: 'newer', iat: next.iat, exp: next.exp },
      })
      if (kind === 'missing') store.$access_token = null
      if (kind === 'expired') store.$access_token!.exp = 0
      const assertion =
        kind === 'valid'
          ? expect(pending).resolves.toBeUndefined()
          : expect(pending).rejects.toThrow()
      if (kind === 'rejection') response.reject(new Error('old failure'))
      else response.resolve(jwt('older'))
      await assertion
      expect(store.isAuthenticated).toBe(true)
      expect(store.$access_token?.token).not.toBe('older')
    },
  )
  it('ignores an already queued completion after canceling its cross-tab waiter', async () => {
    const store = useStore(createPinia())
    await store.getValidCsrfToken()
    const key = store.$sessionKey
    lock()
    const pending = store.verifyToken()
    const rejected = expect(pending).rejects.toThrow('Session changed')
    const listener = [...channel().listeners][1]!
    store.purgeStore()
    listener({
      data: { source: 'other-tab', type: 'auth:refresh:done', sessionKey: key, success: true },
    })
    await rejected
    expect(channel().listeners.size).toBe(1)
  })
  it('never writes an incoming purge back over newer shared credentials', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt('A', 'account-A'))
    const incoming = crypto.randomUUID()
    const newer = crypto.randomUUID()
    localStorage.setItem('quickfe_auth_identity', JSON.stringify({ key: incoming, userId: null }))
    const purge = store.purgeStore.bind(store)
    vi.spyOn(store, 'purgeStore').mockImplementationOnce((options) => {
      // Another tab commits between event validation and local cleanup.
      localStorage.setItem(
        'quickfe_auth_identity',
        JSON.stringify({ key: newer, userId: 'account-B' }),
      )
      localStorage.setItem('refresh_expiry', JSON.stringify(Date.now() / 1000 + 999))
      purge(options)
    })
    channel().emit({ type: 'auth:purge', sessionKey: incoming })
    expect(JSON.parse(localStorage.getItem('quickfe_auth_identity')!).key).toBe(newer)
    expect(JSON.parse(localStorage.getItem('refresh_expiry')!)).toBe(Date.now() / 1000 + 999)
    expect(store.isCurrentSession(incoming)).toBe(false)
    const next = jwt('B', 'account-B')
    channel().emit({
      type: 'auth:authenticated',
      sessionKey: newer,
      user: next.user.raw,
      accessToken: { token: next.access_token, iat: next.iat, exp: next.exp },
    })
    expect(store.user!.id).toBe('account-B')
  })
  it.each(['{broken', '"invalid"', '{}', '[]', 'true'])(
    'recovers startup with malformed refresh expiry %s',
    async (raw) => {
      localStorage.setItem('refresh_expiry', raw)
      const store = useStore(createPinia())
      await expect(store.initialize()).resolves.toBeUndefined()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('refresh_expiry')).toBeNull()
      expect(api.refresh).not.toHaveBeenCalled()
    },
  )
  it('keeps current in-memory authentication usable when all persistence operations are denied', async () => {
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError')
      })
    }
    const store = useStore(createPinia())
    await store.initialize()
    expect(store.isAuthenticated).toBe(false)
    store.authenticate(jwt('local-access'))
    const key = store.$sessionKey
    await store.initialize()
    expect(await store.getValidAccessToken()).toBe('local-access')
    expect(api.refresh).not.toHaveBeenCalled()
    store.$access_token!.exp = 0
    await Promise.all([store.initialize(), store.initialize()])
    expect(api.refresh).toHaveBeenCalledOnce()
    expect(store.$sessionKey).toBe(key)
    expect(store.$access_token!.token).toBe('refreshed')
    store.purgeStore()
    expect(store.user).toBeNull()
  })
  it.each([
    { owner: '', expiresAt: 100 },
    { owner: 'other', expiresAt: 'invalid' },
    { owner: 'other', expiresAt: 100, operationId: 123 },
    { owner: 'other', expiresAt: 100, operationId: '' },
    { owner: 'other', expiresAt: 100, sessionKey: 123 },
    { owner: 'other', expiresAt: 100, sessionKey: '' },
  ])('ignores unsupported refresh-lock values %j', async (lock) => {
    localStorage.setItem('quickfe_auth_refresh_lock', JSON.stringify(lock))
    await useStore(createPinia()).verifyToken()
    expect(api.refresh).toHaveBeenCalledOnce()
  })
  it.each([
    { key: 1, userId: null },
    { key: '', userId: null },
    { key: 'key', userId: 1 },
    { key: 'key', userId: '' },
  ])('ignores unsupported identity metadata %j', async (identity) => {
    localStorage.setItem('quickfe_auth_identity', JSON.stringify(identity))
    const store = useStore(createPinia())
    await store.getValidCsrfToken()
    expect(JSON.parse(localStorage.getItem('quickfe_auth_identity')!).key).toBe(store.$sessionKey)
  })
  it('preserves a new local session after a failed metadata write without accepting delayed messages from the prior session', async () => {
    const store = useStore(createPinia())
    store.authenticate(jwt('A', 'account-A'))
    const previousKey = store.$sessionKey
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    store.authenticate(jwt('B', 'account-B'), { newSession: true })
    const localKey = store.$sessionKey
    expect(store.isCurrentSession(localKey)).toBe(true)
    await store.initialize()
    expect(await store.getValidAccessToken()).toBe('B')
    const previous = jwt('stale-A', 'account-A')
    channel().emit({
      type: 'auth:authenticated',
      sessionKey: previousKey,
      user: previous.user.raw,
      accessToken: { token: previous.access_token, iat: previous.iat, exp: previous.exp },
    })
    expect(store.user!.id).toBe('account-B')
    expect(store.isCurrentSession('wrong-key')).toBe(false)
    write.mockRestore()
    const nextKey = crypto.randomUUID()
    localStorage.setItem(
      'quickfe_auth_identity',
      JSON.stringify({ key: nextKey, userId: 'account-C' }),
    )
    expect(store.isCurrentSession(localKey)).toBe(false)
    const next = jwt('C', 'account-C')
    channel().emit({
      type: 'auth:authenticated',
      sessionKey: nextKey,
      user: next.user.raw,
      accessToken: { token: next.access_token, iat: next.iat, exp: next.exp },
    })
    expect(store.user!.id).toBe('account-C')
    expect(store.isCurrentSession(nextKey)).toBe(true)
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
