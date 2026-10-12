import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { instance } from '@/shared/api/useLocalhostAPI'
import { useAuthStore, type AuthStore } from '@/shared/stores/auth'

type FailedRequestConfig = InternalAxiosRequestConfig & {
  __quickfeAuthRetried?: boolean
  __quickfePreserveSessionOnUnauthorized?: boolean
}

let sessionInterceptorInitialized = false

function isProtectedSessionRequest(config: FailedRequestConfig | undefined): boolean {
  const path = config?.url?.replace(/^\//, '')
  return (
    !!path &&
    /^(account\/|administration\/|articles\/me(?:\/|$))/.test(path) &&
    !!config?.headers.get('Authorization')
  )
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

  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    async (error: AxiosError) => {
      const config = error.config as FailedRequestConfig | undefined

      if (!isUnauthorizedProtectedRequest(error, config) || !config) return Promise.reject(error)

      config.__quickfeAuthRetried = true

      try {
        await authStore.verifyToken()

        const accessToken = await authStore.getValidAccessToken()
        config.headers.Authorization = `Bearer ${accessToken}`

        return instance.request(config)
      } catch (refreshError) {
        authStore.purgeStore()
        return Promise.reject(refreshError)
      }
    },
  )
}
