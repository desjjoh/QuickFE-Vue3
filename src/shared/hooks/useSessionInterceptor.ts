import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { isAxiosError } from 'axios'

import { instance } from '@/shared/api/useLocalhostAPI'
import { useAuthStore, type AuthStore } from '@/shared/stores/auth'
import { SessionChangedError } from '@/shared/helpers/session-scope'

type FailedRequestConfig = InternalAxiosRequestConfig & {
  __quickfeAuthRetried?: boolean
  __quickfeAuthUserId?: string | null
  __quickfeAuthSessionKey?: string
  __quickfePreserveSessionOnUnauthorized?: boolean
}

let sessionInterceptorInitialized = false
const protectedNamespaces = new Set(['account', 'administration', 'articles'])

function isProtectedSessionRequest(config: FailedRequestConfig | undefined): boolean {
  if (!config?.headers.get('Authorization')) return false
  const namespace = config.url?.split('/').find(Boolean)
  return protectedNamespaces.has(namespace ?? '')
}

function isUnauthorizedProtectedRequest(
  error: AxiosError,
  config: FailedRequestConfig | undefined,
): boolean {
  return (
    error.response?.status === 401 &&
    isProtectedSessionRequest(config) &&
    !config?.__quickfePreserveSessionOnUnauthorized &&
    !config?.__quickfeAuthRetried
  )
}

export function useSessionInterceptor(): void {
  if (sessionInterceptorInitialized) return

  sessionInterceptorInitialized = true
  const authStore: AuthStore = useAuthStore()
  const belongsToCurrentSession = (config: FailedRequestConfig) =>
    config.__quickfeAuthUserId === (authStore.user?.id ?? null) &&
    config.__quickfeAuthSessionKey === authStore.$sessionKey &&
    authStore.isCurrentSession(authStore.$sessionKey)

  instance.interceptors.request.use(
    (config: FailedRequestConfig) => {
      if (isProtectedSessionRequest(config)) {
        if (config.__quickfeAuthSessionKey === undefined && !config.__quickfeAuthRetried) {
          config.__quickfeAuthUserId = authStore.user?.id ?? null
          config.__quickfeAuthSessionKey = authStore.$sessionKey
        }
        if (!belongsToCurrentSession(config)) throw new SessionChangedError()
      }
      return config
    },
    (error: unknown) => {
      throw error
    },
    // Capture ownership at request invocation, before Axios queues any asynchronous work.
    { synchronous: true },
  )

  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      const config = response.config as FailedRequestConfig
      if (isProtectedSessionRequest(config) && !belongsToCurrentSession(config))
        throw new SessionChangedError('Session changed while the request was pending')
      return response
    },
    async (error: AxiosError) => {
      const config = error.config as FailedRequestConfig | undefined

      if (config && isProtectedSessionRequest(config) && !belongsToCurrentSession(config))
        return Promise.reject(
          new SessionChangedError('Session changed while the request was pending'),
        )
      if (!isUnauthorizedProtectedRequest(error, config) || !config) return Promise.reject(error)

      config.__quickfeAuthRetried = true
      const originalToken = authStore.$access_token?.token
      const originalUserId = config.__quickfeAuthUserId
      const originalSessionKey = config.__quickfeAuthSessionKey
      const originalSessionStillActive = () =>
        (authStore.user?.id ?? null) === originalUserId &&
        authStore.$sessionKey === originalSessionKey &&
        authStore.isCurrentSession(authStore.$sessionKey)

      try {
        const cached = authStore.$access_token
        const failedAuthorization = config.headers.get('Authorization')
        const hasNewerValidToken =
          !!cached &&
          cached.exp > Date.now() / 1000 &&
          failedAuthorization !== `Bearer ${cached.token}`
        if (!hasNewerValidToken) await authStore.verifyToken()

        const accessToken = await authStore.getValidAccessToken()
        if (!belongsToCurrentSession(config))
          throw new SessionChangedError('Session changed during request recovery')
        config.headers.Authorization = `Bearer ${accessToken}`

        return instance.request(config)
      } catch (refreshError) {
        if (
          isAxiosError(refreshError) &&
          refreshError.response?.status === 401 &&
          originalSessionStillActive() &&
          authStore.$access_token?.token === originalToken
        )
          authStore.purgeStore()
        return Promise.reject(refreshError)
      }
    },
  )
}
