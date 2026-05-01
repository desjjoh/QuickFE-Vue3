import { useLocalHostAPI } from '@/api/useLocalhostAPI'
import { second } from '@/helpers/time'
import type { CsrfTokenDto, JwtResponseDto } from '@/models/token'
import type { RoleDto, UserDto } from '@/models/user'
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
  purgeStore: () => void
  authenticate: (response: JwtResponseDto) => void
  canActivate: (permissions: string[]) => boolean
  hasRequiredRole: (roles: string[]) => boolean
}

function createDefaultState(): AuthState {
  return {
    $csrf_token: null,
    $access_token: null,
    $authenticated_user: null,
  }
}

type StoreDef = StoreDefinition<'auth', AuthState, AuthGetters, AuthActions>

const localStorage = useLocalStorageUtil<number>('refresh_expiry')
const api = useLocalHostAPI()

export const useAuthStore: StoreDef = defineStore('auth', {
  state: (): AuthState => createDefaultState(),
  getters: {
    isAuthenticated: (state: AuthState): boolean => !!state.$authenticated_user,
    user: (state: AuthState): UserDto | null => state.$authenticated_user,
  },
  actions: {
    async getValidCsrfToken(): Promise<string> {
      const now: number = Date.now()
      const cachedToken: Token | null = this.$csrf_token

      if (!!cachedToken && cachedToken.exp > now) return cachedToken.token

      const csrf: CsrfTokenDto = await api.application.csrfToken()

      this.$csrf_token = csrf

      return csrf.token
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
      const now: number = Date.now() / second
      const exp: number | null = localStorage.getItem()

      if (!exp || Number.isNaN(exp) || now > exp) {
        this.purgeStore()
        return
      }

      await this.verifyToken()
    },

    async verifyToken(): Promise<void> {
      const token: string = await this.getValidCsrfToken()
      const response: JwtResponseDto = await api.authentication.verifyToken(token)

      this.authenticate(response)
    },

    authenticate(response: JwtResponseDto): void {
      this.$authenticated_user = response.user

      this.$access_token = {
        token: response.access_token,
        iat: response.iat,
        exp: response.exp,
      }

      localStorage.saveItem(response.refresh)
    },

    purgeStore(): void {
      this.$state = createDefaultState()
      localStorage.destroyItem()
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
