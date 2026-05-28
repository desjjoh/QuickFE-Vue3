import axios, { type AxiosInstance } from 'axios'

import { second } from '@/helpers/time'

import { useAuthRoutes, type AuthRoutes } from './routes/useAuthRoutes'
import { useSecurityRoutes, type SecurityRoutes } from './routes/useSecurityRoutes'
import { APP_ENV } from '@/config/env'
import { useLibraryRoutes, type LibraryRoutes } from './routes/useLibraryRoutes'

export const instance: AxiosInstance = axios.create({
  baseURL: APP_ENV.API_BASE_URL,
  timeout: 10 * second,
  headers: { ['Content-Type']: 'application/json' },
})

export interface LocalHostAPI {
  security: SecurityRoutes
  authentication: AuthRoutes
  library: LibraryRoutes
}

export function useLocalHostAPI(): LocalHostAPI {
  const security: SecurityRoutes = useSecurityRoutes()
  const authentication: AuthRoutes = useAuthRoutes()
  const library: LibraryRoutes = useLibraryRoutes()

  return {
    security,
    authentication,
    library,
  }
}
