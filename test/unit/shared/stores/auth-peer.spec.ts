import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { JwtResponseDto, CsrfTokenDto } from '@/library/models/token'
import { buildUser } from '@test/support/fixtures'
import { useTestClock } from '@test/support/async'

const api = vi.hoisted(() => ({ csrf: vi.fn(), refresh: vi.fn() }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({
    security: { csrfToken: api.csrf },
    authentication: { verifyToken: api.refresh },
  }),
}))
type Message = Record<string, unknown>
class Channel {
  static current: Channel
  sent: Message[] = []
  listeners = new Set<(event: { data: Message }) => void>()
  constructor() {
    Channel.current = this
  }
  postMessage(message: Message) {
    this.sent.push(message)
  }
  addEventListener(_type: string, listener: (event: { data: Message }) => void) {
    this.listeners.add(listener)
  }
  removeEventListener(_type: string, listener: (event: { data: Message }) => void) {
    this.listeners.delete(listener)
  }
  close = vi.fn()
  emit(message: Message) {
    for (const listener of [...this.listeners]) listener({ data: { source: 'peer', ...message } })
  }
}
let useAuth: typeof import('@/shared/stores/auth').useAuthStore
let store: ReturnType<typeof useAuth>
const jwt = () =>
  new JwtResponseDto({
    access_token: 'access',
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 100,
    refresh: Date.now() / 1000 + 200,
    user: buildUser(),
  })
const csrf = () => new CsrfTokenDto({ token: 'shared-csrf', iat: 0, exp: Date.now() / 1000 + 100 })
beforeEach(async () => {
  vi.resetModules()
  vi.resetAllMocks()
  useTestClock()
  vi.stubGlobal('BroadcastChannel', Channel)
  api.csrf.mockResolvedValue(csrf())
  api.refresh.mockResolvedValue(jwt())
  localStorage.setItem(
    'quickfe_auth_identity',
    JSON.stringify({ key: 'shared-session', userId: jwt().user.id }),
  )
  localStorage.setItem('refresh_expiry', JSON.stringify(jwt().refresh))
  useAuth = (await import('@/shared/stores/auth')).useAuthStore
  store = useAuth(createPinia())
})
afterEach(() => {
  store.$dispose()
})
function respond(overrides: Message = {}) {
  const request = Channel.current.sent.filter((message) => message.type === 'auth:request').at(-1)!
  Channel.current.emit({
    type: 'auth:authenticated',
    recipient: request.source,
    operationId: request.operationId,
    sessionKey: store.$sessionKey,
    user: jwt().user.raw,
    accessToken: { token: 'peer-access', iat: 0, exp: Date.now() / 1000 + 100 },
    csrfToken: csrf(),
    ...overrides,
  })
}

describe('peer-first session recovery', () => {
  it('adopts both credentials before loading and never calls either token endpoint', async () => {
    const timeouts = vi.spyOn(window, 'setTimeout')
    const cleared = vi.spyOn(window, 'clearTimeout')
    const pending = store.initialize()
    const timerIndex = timeouts.mock.calls.findIndex((call) => call[1] === 250)
    const peerTimer = timeouts.mock.results[timerIndex]!.value
    respond()
    await pending
    expect(await store.getValidAccessToken()).toBe('peer-access')
    expect(await store.getValidCsrfToken()).toBe('shared-csrf')
    expect(api.csrf).not.toHaveBeenCalled()
    expect(api.refresh).not.toHaveBeenCalled()
    expect(Channel.current.listeners.size).toBe(1)
    expect(cleared).toHaveBeenCalledWith(peerTimer)
    // A timeout callback already queued before completion must not undo the handoff.
    const lateTimeout = timeouts.mock.calls[timerIndex]![0] as () => void
    lateTimeout()
    expect(store.$access_token!.token).toBe('peer-access')
  })
  it('falls back once when no tab responds and ignores late addressed replies', async () => {
    const pending = store.initialize()
    const request = Channel.current.sent
      .filter((message) => message.type === 'auth:request')
      .at(-1)!
    await vi.advanceTimersByTimeAsync(250)
    await pending
    Channel.current.emit({
      type: 'auth:authenticated',
      recipient: request.source,
      operationId: request.operationId,
      sessionKey: store.$sessionKey,
      user: jwt().user.raw,
      accessToken: { token: 'obsolete', iat: 0, exp: Date.now() / 1000 + 100 },
    })
    expect(store.$access_token!.token).toBe('access')
    expect(api.refresh).toHaveBeenCalledOnce()
    expect(Channel.current.listeners.size).toBe(1)
  })
  it.each([
    'different recipient',
    'different operation',
    'different session',
    'expired',
    'wrong user',
  ])('does not adopt %s credentials while waiting', async (kind) => {
    const pending = store.initialize()
    const variants: Record<string, Message> = {
      'different recipient': { recipient: 'another-tab' },
      'different operation': { operationId: 'obsolete' },
      'different session': { sessionKey: 'obsolete' },
      expired: { accessToken: { token: 'expired', iat: 0, exp: Date.now() / 1000 } },
      'wrong user': { user: { ...jwt().user.raw, id: 'different-user' } },
    }
    respond(variants[kind])
    expect(store.isAuthenticated).toBe(false)
    respond()
    await pending
    expect(store.$access_token!.token).toBe('peer-access')
    expect(api.refresh).not.toHaveBeenCalled()
  })
  it('cancels the pending handoff on logout and removes the timer and listener', async () => {
    const timeouts = vi.spyOn(window, 'setTimeout')
    const cleared = vi.spyOn(window, 'clearTimeout')
    const pending = store.initialize()
    const timerIndex = timeouts.mock.calls.findIndex((call) => call[1] === 250)
    const peerTimer = timeouts.mock.results[timerIndex]!.value
    const rejected = expect(pending).rejects.toThrow('Session changed')
    store.purgeStore()
    await rejected
    expect(api.refresh).not.toHaveBeenCalled()
    expect(Channel.current.listeners.size).toBe(1)
    expect(cleared).toHaveBeenCalledWith(peerTimer)
  })
  it('replies with cached access and CSRF tokens without issuing new tokens', async () => {
    await store.getValidCsrfToken()
    store.authenticate(jwt(), { newSession: true })
    Channel.current.emit({
      type: 'auth:request',
      sessionKey: store.$sessionKey,
      operationId: 'request-one',
    })
    expect(Channel.current.sent.at(-1)).toMatchObject({
      type: 'auth:authenticated',
      recipient: 'peer',
      operationId: 'request-one',
      accessToken: { token: 'access' },
      csrfToken: { token: 'shared-csrf' },
    })
    expect(api.csrf).toHaveBeenCalledOnce()
    expect(api.refresh).not.toHaveBeenCalled()
  })
  it('does not reply with expired credentials or credentials from an older identity', () => {
    store.authenticate(jwt())
    store.$access_token!.exp = Date.now() / 1000
    const count = Channel.current.sent.length
    Channel.current.emit({ type: 'auth:request', sessionKey: store.$sessionKey })
    expect(Channel.current.sent).toHaveLength(count)
    localStorage.setItem(
      'quickfe_auth_identity',
      JSON.stringify({ key: 'newer-session', userId: jwt().user.id }),
    )
    Channel.current.emit({ type: 'auth:request', sessionKey: 'newer-session' })
    expect(Channel.current.sent).toHaveLength(count)
  })
})
