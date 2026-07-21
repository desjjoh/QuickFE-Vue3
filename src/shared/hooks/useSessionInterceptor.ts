import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { instance } from '@/api/useLocalhostAPI'
import { useAuthStore, type AuthStore } from '@/stores/auth'

type FailedRequestConfig = InternalAxiosRequestConfig & {
  __quickfeAuthHandled?: boolean
  __quickfePreserveSessionOnUnauthorized?: boolean
}

let sessionInterceptorInitialized = false

function isProtectedSessionRequest(url: string | undefined): boolean {
  if (!url) return false

  return !url.startsWith('authentication/') && !url.startsWith('security/')
}

function shouldPurgeSession(error: AxiosError, config: FailedRequestConfig | undefined): boolean {
  return (
    error.response?.status === 401 &&
    isProtectedSessionRequest(config?.url) &&
    !config?.__quickfePreserveSessionOnUnauthorized &&
    !config?.__quickfeAuthHandled
  )
}

export function useSessionInterceptor(): void {
  if (sessionInterceptorInitialized) return

  sessionInterceptorInitialized = true

  const authStore: AuthStore = useAuthStore()

  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    (error: AxiosError) => {
      const config = error.config as FailedRequestConfig | undefined

      if (shouldPurgeSession(error, config)) {
        if (config) config.__quickfeAuthHandled = true

        authStore.purgeStore()
      }

      return Promise.reject(error)
    },
  )
}
