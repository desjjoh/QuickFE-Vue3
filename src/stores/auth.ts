import { useLocalHostAPI } from '@/api/useLocalhostAPI'
import { second } from '@/helpers/time'
import type { CsrfTokenDto, JwtResponseDto } from '@/library/models/token'
import { UserDto, type RoleDto, type User } from '@/library/models/user'
import { useLocalStorageUtil } from '@/shared/hooks/useLocalStorage'
import { defineStore, type Store, type StoreDefinition } from 'pinia'

interface Token {
  token: string
  iat: number
  exp: number
}

export interface AuthState {
  $csrf_token: Token | null
  $access_token: Token | null
  $authenticated_user: UserDto | null
}

interface AuthGetters {
  isAuthenticated: (state: AuthState) => boolean
  user: (state: AuthState) => UserDto | null
}

interface AuthActions {
  initialize: () => Promise<void>
  verifyToken: () => Promise<void>
  getValidCsrfToken: () => Promise<string>
  getValidAccessToken: () => Promise<string>
  purgeStore: (options?: PurgeOptions) => void
  authenticate: (response: JwtResponseDto, options?: BroadcastOptions) => void
  updateAuthenticatedUser: (user: UserDto) => void
  canActivate: (permissions: string[]) => boolean
  hasRequiredRole: (roles: string[]) => boolean
}

interface BroadcastOptions {
  broadcast?: boolean
}

interface PurgeOptions extends BroadcastOptions {
  destroyRefreshExpiry?: boolean
}

interface AuthBroadcastMessage {
  type:
    | 'auth:csrf'
    | 'auth:authenticated'
    | 'auth:purge'
    | 'auth:refresh:start'
    | 'auth:refresh:done'
  source: string
  csrfToken?: Token | null
  accessToken?: Token | null
  user?: User | null
  refresh?: number
  success?: boolean
}

function createDefaultState(): AuthState {
  return {
    $csrf_token: null,
    $access_token: null,
    $authenticated_user: null,
  }
}

type StoreDef = StoreDefinition<'auth', AuthState, AuthGetters, AuthActions>

const refreshExpiryStorage = useLocalStorageUtil<number>('refresh_expiry')
const api = useLocalHostAPI()
const AUTH_CHANNEL_NAME = 'quickfe-auth-session'
const REFRESH_LOCK_KEY = 'quickfe_auth_refresh_lock'
const REFRESH_LOCK_TIMEOUT = 15_000
const TAB_ID = crypto.randomUUID()

let authChannel: BroadcastChannel | null = null
let csrfTokenRequest: Promise<string> | null = null
let refreshRequest: Promise<void> | null = null
let channelInitialized = false

interface RefreshLock {
  owner: string
  expiresAt: number
}

function getAuthChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null

  authChannel ??= new BroadcastChannel(AUTH_CHANNEL_NAME)
  return authChannel
}

function cloneBroadcastMessage(message: AuthBroadcastMessage): AuthBroadcastMessage {
  return JSON.parse(JSON.stringify(message)) as AuthBroadcastMessage
}

function broadcast(message: Omit<AuthBroadcastMessage, 'source'>): void {
  const channel = getAuthChannel()
  if (!channel) return

  channel.postMessage(cloneBroadcastMessage({ ...message, source: TAB_ID }))
}

function readRefreshLock(): RefreshLock | null {
  const rawLock = window.localStorage.getItem(REFRESH_LOCK_KEY)
  if (!rawLock) return null

  try {
    return JSON.parse(rawLock) as RefreshLock
  } catch {
    window.localStorage.removeItem(REFRESH_LOCK_KEY)
    return null
  }
}

function isRefreshLockedByAnotherTab(): boolean {
  const lock = readRefreshLock()

  if (!lock) return false
  if (lock.owner === TAB_ID) return false
  if (lock.expiresAt <= Date.now()) {
    window.localStorage.removeItem(REFRESH_LOCK_KEY)
    return false
  }

  return true
}

function acquireRefreshLock(): boolean {
  if (isRefreshLockedByAnotherTab()) return false

  window.localStorage.setItem(
    REFRESH_LOCK_KEY,
    JSON.stringify({ owner: TAB_ID, expiresAt: Date.now() + REFRESH_LOCK_TIMEOUT }),
  )

  return true
}

function releaseRefreshLock(): void {
  const lock = readRefreshLock()

  if (lock?.owner === TAB_ID) window.localStorage.removeItem(REFRESH_LOCK_KEY)
}

function waitForCrossTabRefresh(): Promise<void> {
  return new Promise((resolve, reject) => {
    const channel = getAuthChannel()

    if (!channel) {
      reject(new Error('Another tab is refreshing the session'))
      return
    }

    const timeout = window.setTimeout(() => {
      channel.removeEventListener('message', listener)
      reject(new Error('Timed out waiting for another tab to refresh the session'))
    }, REFRESH_LOCK_TIMEOUT)

    const listener = (event: MessageEvent<AuthBroadcastMessage>) => {
      if (event.data.source === TAB_ID || event.data.type !== 'auth:refresh:done') return

      window.clearTimeout(timeout)
      channel.removeEventListener('message', listener)

      if (event.data.success) resolve()
      else reject(new Error('Another tab could not refresh the session'))
    }

    channel.addEventListener('message', listener)
  })
}

function initializeChannel(store: AuthStore): void {
  if (channelInitialized) return

  const channel = getAuthChannel()
  if (!channel) return

  channelInitialized = true
  channel.addEventListener('message', (event: MessageEvent<AuthBroadcastMessage>) => {
    const message = event.data
    if (message.source === TAB_ID) return

    if (message.type === 'auth:csrf' && message.csrfToken) store.$csrf_token = message.csrfToken

    if (message.type === 'auth:authenticated' && message.accessToken && message.user) {
      store.$access_token = message.accessToken
      store.$authenticated_user = new UserDto(message.user)
      if (message.refresh) refreshExpiryStorage.saveItem(message.refresh)
    }

    if (message.type === 'auth:purge') store.purgeStore({ broadcast: false })
  })
}

export const useAuthStore: StoreDef = defineStore('auth', {
  state: (): AuthState => createDefaultState(),
  getters: {
    isAuthenticated: (state: AuthState): boolean => !!state.$authenticated_user,
    user: (state: AuthState): UserDto | null => state.$authenticated_user,
  },
  actions: {
    async getValidCsrfToken(): Promise<string> {
      initializeChannel(this)

      const now: number = Date.now() / second
      const cachedToken: Token | null = this.$csrf_token

      if (!!cachedToken && cachedToken.exp > now) return cachedToken.token

      csrfTokenRequest ??= api.security
        .csrfToken()
        .then((csrf: CsrfTokenDto) => {
          this.$csrf_token = csrf
          broadcast({ type: 'auth:csrf', csrfToken: csrf })
          return csrf.token
        })
        .finally(() => {
          csrfTokenRequest = null
        })

      return csrfTokenRequest
    },

    async getValidAccessToken(): Promise<string> {
      const now = Date.now() / second

      if (this.$access_token && this.$access_token.exp > now) return this.$access_token.token

      await this.verifyToken()

      const token = this.$access_token?.token

      if (!token) throw new Error('Could not retrieve access token')

      return token
    },

    async initialize(): Promise<void> {
      initializeChannel(this)

      const now: number = Date.now() / second
      const exp: number | null = refreshExpiryStorage.getItem()

      if (!exp || Number.isNaN(exp) || now > exp) {
        this.purgeStore()
        return
      }

      await this.verifyToken()
    },

    async verifyToken(): Promise<void> {
      initializeChannel(this)

      if (refreshRequest) return refreshRequest

      if (!acquireRefreshLock()) {
        await waitForCrossTabRefresh()

        if (this.$access_token) return
      }

      refreshRequest = (async () => {
        broadcast({ type: 'auth:refresh:start' })

        try {
          const token: string = await this.getValidCsrfToken()
          const response: JwtResponseDto = await api.authentication.verifyToken(token)

          this.authenticate(response)
          broadcast({ type: 'auth:refresh:done', success: true })
        } catch (error) {
          this.purgeStore()
          broadcast({ type: 'auth:refresh:done', success: false })
          throw error
        } finally {
          releaseRefreshLock()
          refreshRequest = null
        }
      })()

      return refreshRequest
    },

    authenticate(response: JwtResponseDto, options: BroadcastOptions = {}): void {
      initializeChannel(this)

      this.$authenticated_user = response.user

      this.$access_token = {
        token: response.access_token,
        iat: response.iat,
        exp: response.exp,
      }

      refreshExpiryStorage.saveItem(response.refresh)

      if (options.broadcast ?? true) {
        broadcast({
          type: 'auth:authenticated',
          accessToken: this.$access_token,
          user: this.$authenticated_user,
          refresh: response.refresh,
        })
      }
    },

    updateAuthenticatedUser(user: UserDto): void {
      this.$authenticated_user = new UserDto(user)
    },

    purgeStore(options: PurgeOptions = {}): void {
      this.$state = createDefaultState()
      if (options.destroyRefreshExpiry ?? true) refreshExpiryStorage.destroyItem()
      if (options.broadcast ?? true) broadcast({ type: 'auth:purge' })
    },

    canActivate(permissions: string[]): boolean {
      const user_permissions: string[] = this.$authenticated_user?.getPermissions() ?? []
      if (user_permissions.includes('has_all_permissions')) return true

      return permissions.some((permission: string) => user_permissions?.includes(permission))
    },

    hasRequiredRole(roles: string[]): boolean {
      const userRoles = this.$authenticated_user?.roles.map((role: RoleDto) => role.key) ?? []

      return roles.some((role: string) => userRoles.includes(role))
    },
  },
})

export type AuthStore = Store<'auth', AuthState, AuthGetters, AuthActions>
