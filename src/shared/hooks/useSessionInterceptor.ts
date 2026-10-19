import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { instance } from '@/shared/api/useLocalhostAPI'
import { useAuthStore, type AuthStore } from '@/shared/stores/auth'

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
    config.__quickfeAuthSessionKey === authStore.$sessionKey

  instance.interceptors.request.use((config: FailedRequestConfig) => {
    if (isProtectedSessionRequest(config) && !config.__quickfeAuthRetried) {
      config.__quickfeAuthUserId = authStore.user?.id ?? null
      config.__quickfeAuthSessionKey = authStore.$sessionKey
    }
    return config
  })

  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      const config = response.config as FailedRequestConfig
      if (isProtectedSessionRequest(config) && !belongsToCurrentSession(config))
        throw new Error('Session changed while the request was pending')
      return response
    },
    async (error: AxiosError) => {
      const config = error.config as FailedRequestConfig | undefined

      if (config && isProtectedSessionRequest(config) && !belongsToCurrentSession(config))
        return Promise.reject(new Error('Session changed while the request was pending'))
      if (!isUnauthorizedProtectedRequest(error, config) || !config) return Promise.reject(error)

      config.__quickfeAuthRetried = true
      const originalToken = authStore.$access_token?.token

      try {
        await authStore.verifyToken()

        const accessToken = await authStore.getValidAccessToken()
        if (!belongsToCurrentSession(config))
          throw new Error('Session changed during request recovery')
        config.headers.Authorization = `Bearer ${accessToken}`

        return instance.request(config)
      } catch (refreshError) {
        if (belongsToCurrentSession(config) && authStore.$access_token?.token === originalToken)
          authStore.purgeStore()
        return Promise.reject(refreshError)
      }
    },
  )
}
