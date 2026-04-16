import { second } from '@/helpers/time'
import type { CsrfTokenDto, JwtResponseDto } from '@/models/token'
import type { UserDto } from '@/models/user'
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
  purgeStore: () => void
  authenticate: (response: JwtResponseDto) => void
  canActivate: (permissions: string[]) => boolean
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

      const csrf: CsrfTokenDto = await api.csrfToken()

      this.$csrf_token = csrf

      return csrf.token
    },

    async verifyToken(): Promise<void> {
      const token: string = await this.getValidCsrfToken()
      const response: JwtResponseDto = await api.verifyToken(token)

      this.authenticate(response)
    },

    async initialize(): Promise<void> {
      const now: number = Date.now() / second
      const exp: number | null = localStorage.getItem()

      if (!exp || Number.isNaN(exp) || now > exp) {
        localStorage.destroyItem()
        return
      }

      await this.verifyToken()
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

      // TODO : Replace 'has_all_permissions' with proper ENUM (04/15/26)
      if (user_permissions?.includes('has_all_permissions')) return true

      return permissions.some((permission: string) => user_permissions?.includes(permission))
    },
  },
})

export type AuthStore = Store<'auth', AuthState, AuthGetters, AuthActions>
