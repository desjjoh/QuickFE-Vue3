import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { second } from '@/shared/helpers/time'
import type { CsrfTokenDto, JwtResponseDto } from '@/library/models/token'
import { UserDto, type RoleDto, type User } from '@/library/models/user'
import { useLocalStorageUtil } from '@/shared/hooks/useLocalStorage'
import { defineStore, type Store, type StoreDefinition } from 'pinia'
import { SystemPermissions, type PermissionKey, type RoleKey } from '@/config/permissions'
import { clearAccountData } from '@/shared/helpers/account-data'
import { createSessionScope, SessionChangedError } from '@/shared/helpers/session-scope'
import { RefreshCoordinationError } from '@/shared/helpers/refresh-coordination'
import { isAxiosError } from 'axios'
import { withBrowserLock } from '@/shared/helpers/browser-lock'

interface Token {
  token: string
  iat: number
  exp: number
}

export interface AuthState {
  $sessionKey: string
  $csrf_token: Token | null
  $access_token: Token | null
  $authenticated_user: UserDto | null
}

interface AuthGetters {
  isAuthenticated: (state: AuthState) => boolean
  user: (state: AuthState) => UserDto | null
}

interface AuthActions {
  isCurrentSession: (key: string) => boolean
  initialize: () => Promise<void>
  verifyToken: () => Promise<void>
  getValidCsrfToken: () => Promise<string>
  getValidAccessToken: () => Promise<string>
  purgeStore: (options?: PurgeOptions) => void
  authenticate: (response: JwtResponseDto, options?: AuthenticateOptions) => void
  updateAuthenticatedUser: (user: UserDto) => void
  canActivate: (permissions: readonly PermissionKey[]) => boolean
  hasRequiredRole: (roles: readonly RoleKey[]) => boolean
}

interface BroadcastOptions {
  broadcast?: boolean
}

interface AuthenticateOptions extends BroadcastOptions {
  newSession?: boolean
}

interface PurgeOptions extends BroadcastOptions {
  sessionKey?: string
  destroyRefreshExpiry?: boolean
}

interface AuthBroadcastMessage {
  type:
    | 'auth:csrf'
    | 'auth:authenticated'
    | 'auth:purge'
    | 'auth:refresh:start'
    | 'auth:refresh:done'
    | 'auth:request'
  source: string
  recipient?: string
  sessionKey: string
  operationId?: string
  csrfToken?: Token | null
  accessToken?: Token | null
  user?: User | null
  refresh?: number
  success?: boolean
}

function createDefaultState(): AuthState {
  return {
    $sessionKey: readSessionIdentity()?.key ?? crypto.randomUUID(),
    $csrf_token: null,
    $access_token: null,
    $authenticated_user: null,
  }
}

type StoreDef = StoreDefinition<'auth', AuthState, AuthGetters, AuthActions>

const refreshExpiryStorage = useLocalStorageUtil<number>(
  'refresh_expiry',
  (value): value is number => typeof value === 'number' && Number.isFinite(value),
)
const api = useLocalHostAPI()
const AUTH_CHANNEL_NAME = 'quickfe-auth-session'
const REFRESH_LOCK_KEY = 'quickfe_auth_refresh_lock'
const REFRESH_LOCK_TIMEOUT = 15_000
const PEER_SESSION_TIMEOUT = 250
const TAB_ID = crypto.randomUUID()

// This metadata coordinates ownership only. Credentials remain in memory/cookies.
const SESSION_IDENTITY_KEY = 'quickfe_auth_identity'
interface SessionIdentity {
  key: string
  userId: string | null
}
const sessionIdentityStorage = useLocalStorageUtil<SessionIdentity>(
  SESSION_IDENTITY_KEY,
  (value): value is SessionIdentity => {
    const identity = value as Partial<SessionIdentity> | null
    return (
      !!identity &&
      typeof identity.key === 'string' &&
      !!identity.key &&
      (identity.userId === null || (typeof identity.userId === 'string' && !!identity.userId))
    )
  },
)
function readSessionIdentity(): SessionIdentity | null {
  return sessionIdentityStorage.getItem()
}
function saveIdentity(store: AuthStore): void {
  const sharedKey = readSessionIdentity()?.key ?? null
  if (sessionIdentityStorage.saveItem({ key: store.$sessionKey, userId: store.user?.id ?? null })) {
    delete runtime(store).unpersistedIdentity
  } else {
    // Retain this tab's session if a quota/policy failure left older metadata readable.
    runtime(store).unpersistedIdentity = { key: store.$sessionKey, sharedKey }
  }
}
interface Pending<T> {
  key: string
  promise: Promise<T>
}
interface Runtime {
  unpersistedIdentity?: { key: string; sharedKey: string | null }
  channel?: BroadcastChannel | null
  initialized: boolean
  epoch: number
  csrf?: Pending<string>
  refresh?: Pending<void>
  initialization?: Pending<void>
  peerOperation?: string
  cancelWaiters: Set<() => void>
}
const runtimes = new WeakMap<AuthStore, Runtime>()
function runtime(store: AuthStore): Runtime {
  let state = runtimes.get(store)
  if (!state) {
    state = { initialized: false, epoch: 0, cancelWaiters: new Set() }
    runtimes.set(store, state)
  }
  return state
}
function currentSession(store: AuthStore, key: string): boolean {
  const shared = readSessionIdentity()
  const local = runtime(store).unpersistedIdentity
  return (
    store.$sessionKey === key &&
    (!shared || shared.key === key || (local?.key === key && local.sharedKey === shared.key))
  )
}
function assertSession(store: AuthStore, key: string): void {
  if (!currentSession(store, key)) throw new SessionChangedError()
}
function sessionChanged(store: AuthStore): void {
  const state = runtime(store)
  state.epoch++
  for (const cancel of [...state.cancelWaiters]) cancel()
}

// Register before executing work; only the owning operation may clear its slot.
function pendingWork<T>(
  state: Runtime,
  slot: 'csrf' | 'refresh' | 'initialization',
  key: string,
  run: () => Promise<T>,
): Promise<T> {
  const existing = state[slot]
  if (existing?.key === key) return existing.promise as Promise<T>
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  const entry = { key, promise }
  Object.assign(state, { [slot]: entry })
  void run().then(
    (value) => {
      if (state[slot] === entry) delete state[slot]
      resolve(value)
    },
    (error) => {
      if (state[slot] === entry) delete state[slot]
      reject(error)
    },
  )
  return promise
}
interface RefreshLock {
  owner: string
  expiresAt: number
  operationId?: string
  sessionKey?: string
}
function getAuthChannel(store: AuthStore): BroadcastChannel | null {
  if (typeof window.BroadcastChannel !== 'function') return null
  return (runtime(store).channel ??= new BroadcastChannel(AUTH_CHANNEL_NAME))
}
function broadcast(
  store: AuthStore,
  message: Omit<AuthBroadcastMessage, 'source' | 'sessionKey'> & { sessionKey?: string },
): void {
  getAuthChannel(store)?.postMessage(
    JSON.parse(JSON.stringify({ sessionKey: store.$sessionKey, ...message, source: TAB_ID })),
  )
}
const refreshLockStorage = useLocalStorageUtil<RefreshLock>(
  REFRESH_LOCK_KEY,
  (value): value is RefreshLock => {
    const lock = value as Partial<RefreshLock> | null
    return (
      !!lock &&
      typeof lock.owner === 'string' &&
      !!lock.owner &&
      Number.isFinite(lock.expiresAt) &&
      (lock.operationId === undefined ||
        (typeof lock.operationId === 'string' && !!lock.operationId)) &&
      (lock.sessionKey === undefined || (typeof lock.sessionKey === 'string' && !!lock.sessionKey))
    )
  },
)
function readRefreshLock(): RefreshLock | null {
  return refreshLockStorage.getItem()
}
function acquireRefreshLock(key: string, operationId: string): RefreshLock | null {
  const lock = readRefreshLock()
  if (
    lock &&
    lock.owner !== TAB_ID &&
    lock.expiresAt > Date.now() &&
    (!lock.sessionKey || lock.sessionKey === key)
  )
    return lock
  refreshLockStorage.saveItem({
    owner: TAB_ID,
    operationId,
    sessionKey: key,
    expiresAt: Date.now() + REFRESH_LOCK_TIMEOUT,
  })
  return null
}
function releaseRefreshLock(operationId: string): void {
  const lock = readRefreshLock()
  if (lock?.owner === TAB_ID && lock.operationId === operationId) refreshLockStorage.destroyItem()
}
function waitForCrossTabRefresh(store: AuthStore, key: string, lock: RefreshLock): Promise<void> {
  return new Promise((resolve, reject) => {
    const channel = getAuthChannel(store)
    if (!channel) {
      reject(new RefreshCoordinationError('Another tab is refreshing the session'))
      return
    }
    const state = runtime(store)
    let settled = false
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      channel.removeEventListener('message', listener)
      state.cancelWaiters.delete(cancel)
      if (error) reject(error)
      else resolve()
    }
    const cancel = () => {
      if (!currentSession(store, key)) finish(new SessionChangedError())
    }
    const listener = (event: MessageEvent<AuthBroadcastMessage>) => {
      const message = event.data
      if (
        message.source !== lock.owner ||
        message.type !== 'auth:refresh:done' ||
        message.sessionKey !== key ||
        message.operationId !== lock.operationId
      )
        return
      finish(
        message.success
          ? undefined
          : new RefreshCoordinationError('Another tab could not refresh the session'),
      )
    }
    const timeout = window.setTimeout(
      () =>
        finish(
          new RefreshCoordinationError('Timed out waiting for another tab to refresh the session'),
        ),
      REFRESH_LOCK_TIMEOUT,
    )
    state.cancelWaiters.add(cancel)
    channel.addEventListener('message', listener)
  })
}
function requestPeerSession(store: AuthStore, key: string): Promise<boolean> {
  const channel = getAuthChannel(store)
  if (!channel) return Promise.resolve(false)
  return new Promise((resolve, reject) => {
    const state = runtime(store)
    const operationId = crypto.randomUUID()
    state.peerOperation = operationId
    let settled = false
    const finish = (available: boolean, error?: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      channel.removeEventListener('message', listener)
      state.cancelWaiters.delete(cancel)
      if (state.peerOperation === operationId) delete state.peerOperation
      if (error) reject(error)
      else resolve(available)
    }
    const cancel = () => {
      if (!currentSession(store, key)) finish(false, new SessionChangedError())
    }
    const listener = (event: MessageEvent<AuthBroadcastMessage>) => {
      const message = event.data
      if (
        message.type !== 'auth:authenticated' ||
        message.sessionKey !== key ||
        (message.recipient && (message.recipient !== TAB_ID || message.operationId !== operationId))
      )
        return
      if (
        currentSession(store, key) &&
        store.isAuthenticated &&
        store.$access_token &&
        store.$access_token.exp > Date.now() / second
      )
        finish(true)
    }
    const timeout = window.setTimeout(() => finish(false), PEER_SESSION_TIMEOUT)
    state.cancelWaiters.add(cancel)
    channel.addEventListener('message', listener)
    broadcast(store, { type: 'auth:request', operationId })
  })
}
function initializeChannel(store: AuthStore): void {
  const state = runtime(store)
  if (state.initialized) return
  state.initialized = true
  if (!readSessionIdentity()) saveIdentity(store)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SESSION_IDENTITY_KEY && event.key !== null) return
    if (event.storageArea && event.storageArea !== window.localStorage) return
    const shared = readSessionIdentity()
    if (shared?.key === store.$sessionKey) return
    if (shared && state.unpersistedIdentity?.sharedKey === shared.key) return
    delete state.unpersistedIdentity
    // Storage and BroadcastChannel notifications can arrive independently. Never
    // leave the previous account visible while waiting for a credential broadcast.
    store.purgeStore({
      broadcast: false,
      sessionKey: shared?.key ?? crypto.randomUUID(),
      destroyRefreshExpiry: false,
    })
    if (shared?.userId) {
      // The cookie is authoritative. Web Locks serialize this fallback with other
      // tabs, and queued recovery reuses credentials if the broadcast arrives first.
      void store.getValidAccessToken().catch(() => undefined)
    }
  }
  window.addEventListener('storage', onStorage)
  const dispose = store.$dispose.bind(store)
  store.$dispose = () => {
    window.removeEventListener('storage', onStorage)
    state.channel?.close()
    dispose()
  }
  getAuthChannel(store)?.addEventListener(
    'message',
    (event: MessageEvent<AuthBroadcastMessage>) => {
      const message = event.data
      if (
        message.source === TAB_ID ||
        (message.recipient &&
          (message.recipient !== TAB_ID || message.operationId !== state.peerOperation))
      )
        return
      const shared = readSessionIdentity()
      if (!shared || message.sessionKey !== shared.key) return
      if (state.unpersistedIdentity?.sharedKey === message.sessionKey) return
      delete state.unpersistedIdentity
      if (message.type === 'auth:request') {
        if (
          store.$sessionKey === message.sessionKey &&
          store.user?.id === shared.userId &&
          store.$access_token &&
          store.$access_token.exp > Date.now() / second
        ) {
          broadcast(store, {
            type: 'auth:authenticated',
            recipient: message.source,
            operationId: message.operationId,
            accessToken: store.$access_token,
            csrfToken: store.$csrf_token,
            user: store.user.raw,
          })
        }
        return
      }
      if (
        message.type === 'auth:csrf' &&
        message.csrfToken &&
        message.sessionKey === store.$sessionKey
      )
        store.$csrf_token = message.csrfToken
      if (
        message.type === 'auth:authenticated' &&
        message.accessToken &&
        message.accessToken.exp > Date.now() / second &&
        message.user &&
        shared.userId === message.user.id
      ) {
        const changed =
          store.$sessionKey !== message.sessionKey ||
          (store.isAuthenticated && store.user?.id !== message.user.id)
        if (changed) {
          clearAccountData()
        }
        store.$sessionKey = message.sessionKey
        store.$csrf_token = message.csrfToken ?? (changed ? null : store.$csrf_token)
        store.$access_token = message.accessToken
        store.$authenticated_user = new UserDto(message.user)
        sessionChanged(store)
      }
      if (message.type === 'auth:purge' && shared.userId === null)
        store.purgeStore({
          broadcast: false,
          sessionKey: message.sessionKey,
          destroyRefreshExpiry: false,
        })
    },
  )
}

export const useAuthStore: StoreDef = defineStore('auth', {
  state: (): AuthState => createDefaultState(),
  getters: {
    isAuthenticated: (state: AuthState): boolean => !!state.$authenticated_user,
    user: (state: AuthState): UserDto | null => state.$authenticated_user,
  },
  actions: {
    isCurrentSession(key: string): boolean {
      return currentSession(this, key)
    },
    async getValidCsrfToken(): Promise<string> {
      initializeChannel(this)
      const key = this.$sessionKey
      assertSession(this, key)
      const cached = this.$csrf_token
      if (cached && cached.exp > Date.now() / second) return cached.token
      const state = runtime(this)
      const epoch = state.epoch
      return pendingWork(state, 'csrf', `${key}:${epoch}`, async () => {
        const csrf: CsrfTokenDto = await api.security.csrfToken()
        assertSession(this, key)
        if (epoch !== state.epoch) throw new SessionChangedError()
        this.$csrf_token = csrf
        broadcast(this, { type: 'auth:csrf', csrfToken: csrf })
        return csrf.token
      })
    },
    async getValidAccessToken(): Promise<string> {
      initializeChannel(this)
      assertSession(this, this.$sessionKey)
      const session = this.isAuthenticated ? createSessionScope(this) : undefined
      if (this.$access_token && this.$access_token.exp > Date.now() / second)
        return this.$access_token.token
      await this.verifyToken()
      session?.assertCurrent()
      const token = this.$access_token?.token
      if (!token) throw new Error('Could not retrieve access token')
      return token
    },
    async initialize(): Promise<void> {
      initializeChannel(this)
      const key = this.$sessionKey
      assertSession(this, key)
      return pendingWork(runtime(this), 'initialization', key, async () => {
        const exp = refreshExpiryStorage.getItem()
        if (!this.isAuthenticated && (!exp || Date.now() / second >= exp)) {
          this.purgeStore()
          return
        }
        await this.getValidAccessToken()
      })
    },
    async verifyToken(): Promise<void> {
      initializeChannel(this)
      const key = this.$sessionKey
      assertSession(this, key)
      const state = runtime(this)
      const epoch = state.epoch
      const previousAccessToken = this.$access_token?.token
      return pendingWork(state, 'refresh', key, async () => {
        if (
          !this.$access_token &&
          readSessionIdentity()?.userId &&
          (await requestPeerSession(this, key))
        )
          return
        return withBrowserLock(AUTH_CHANNEL_NAME, async () => {
          assertSession(this, key)
          // A tab ahead of us may already have rotated and broadcast credentials.
          if (
            this.$access_token &&
            this.$access_token.exp > Date.now() / second &&
            (epoch !== state.epoch || this.$access_token.token !== previousAccessToken)
          )
            return
          const operationId = crypto.randomUUID()
          const lock = acquireRefreshLock(key, operationId)
          if (lock) {
            await waitForCrossTabRefresh(this, key, lock)
            assertSession(this, key)
            if (this.$access_token && this.$access_token.exp > Date.now() / second) return
            if (acquireRefreshLock(key, operationId))
              throw new RefreshCoordinationError('Another tab is refreshing the session')
          }
          broadcast(this, { type: 'auth:refresh:start', operationId })
          try {
            let token = await this.getValidCsrfToken()
            assertSession(this, key)
            let response: JwtResponseDto
            try {
              response = await api.authentication.verifyToken(token)
            } catch (error) {
              assertSession(this, key)
              // NestJS rejects CSRF before rotating refresh credentials. Another tab can
              // replace the shared CSRF cookie; renew the pair and retry exactly once.
              if (!isAxiosError(error) || error.response?.status !== 403) throw error
              if (epoch !== state.epoch) throw new SessionChangedError()
              this.$csrf_token = null
              token = await this.getValidCsrfToken()
              assertSession(this, key)
              if (epoch !== state.epoch) throw new SessionChangedError()
              response = await api.authentication.verifyToken(token)
            }
            assertSession(this, key)
            if (epoch !== state.epoch) {
              if (this.$access_token && this.$access_token.exp > Date.now() / second) return
              throw new SessionChangedError()
            }
            const shared = readSessionIdentity()
            if (shared?.userId && shared.userId !== response.user.id)
              throw new SessionChangedError('Refresh returned a different shared account')
            this.authenticate(response, { newSession: false })
            broadcast(this, {
              type: 'auth:refresh:done',
              operationId,
              sessionKey: key,
              success: true,
            })
          } catch (error) {
            if (!currentSession(this, key)) throw new SessionChangedError()
            if (epoch === state.epoch) {
              // A CSRF, network or server failure does not establish session revocation.
              if (isAxiosError(error) && error.response?.status === 401) this.purgeStore()
              broadcast(this, {
                type: 'auth:refresh:done',
                operationId,
                sessionKey: key,
                success: false,
              })
            }
            throw error
          } finally {
            releaseRefreshLock(operationId)
          }
        })
      })
    },
    authenticate(response: JwtResponseDto, options: AuthenticateOptions = {}): void {
      initializeChannel(this)
      const shared = readSessionIdentity()
      const changed =
        options.newSession === true ||
        (options.newSession !== false && this.user?.id !== response.user.id) ||
        (this.isAuthenticated && this.user?.id !== response.user.id) ||
        (shared?.userId && shared.userId !== response.user.id)
      if (changed) {
        clearAccountData()
        this.$sessionKey = crypto.randomUUID()
      }
      this.$authenticated_user = response.user
      this.$access_token = { token: response.access_token, iat: response.iat, exp: response.exp }
      saveIdentity(this)
      sessionChanged(this)
      refreshExpiryStorage.saveItem(response.refresh)
      if (options.broadcast ?? true)
        broadcast(this, {
          type: 'auth:authenticated',
          accessToken: this.$access_token,
          csrfToken: this.$csrf_token,
          user: this.$authenticated_user.raw,
          refresh: response.refresh,
        })
    },

    updateAuthenticatedUser(user: UserDto): void {
      if (!this.$authenticated_user || this.$authenticated_user.id !== user.id) return
      this.$authenticated_user = new UserDto(user.raw)
    },

    purgeStore(options: PurgeOptions = {}): void {
      clearAccountData()
      this.$state = {
        ...createDefaultState(),
        $sessionKey: options.sessionKey ?? crypto.randomUUID(),
      }
      // Only the originating tab writes shared storage. An incoming event can already
      // be superseded while another process handles it; never write that old key back.
      if (!options.sessionKey) saveIdentity(this)
      sessionChanged(this)
      if (options.destroyRefreshExpiry ?? true) refreshExpiryStorage.destroyItem()
      if (options.broadcast ?? true) broadcast(this, { type: 'auth:purge' })
    },

    canActivate(permissions: readonly PermissionKey[]): boolean {
      const user_permissions: string[] = this.$authenticated_user?.getPermissions() ?? []
      if (user_permissions.includes(SystemPermissions.HAS_ALL_PERMISSIONS)) return true

      return permissions.some((permission: string) => user_permissions?.includes(permission))
    },

    hasRequiredRole(roles: readonly RoleKey[]): boolean {
      const userRoles = this.$authenticated_user?.roles.map((role: RoleDto) => role.key) ?? []

      return roles.some((role: string) => userRoles.includes(role))
    },
  },
})

export type AuthStore = Store<'auth', AuthState, AuthGetters, AuthActions>
