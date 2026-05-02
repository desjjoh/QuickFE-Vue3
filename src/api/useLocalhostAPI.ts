import axios, { type AxiosInstance } from 'axios'

import { second } from '@/helpers/time'

import { useAuthRoutes, type AuthRoutes } from './routes/useAuthRoutes'
import { useSecurityRoutes, type SecurityRoutes } from './routes/useSecurityRoutes'

export const instance: AxiosInstance = axios.create({
  baseURL: 'https://localhost:4000/api/v1',
  timeout: 10 * second,
  headers: { ['Content-Type']: 'application/json' },
})

export interface LocalHostAPI {
  security: SecurityRoutes
  authentication: AuthRoutes
}

export function useLocalHostAPI(): LocalHostAPI {
  const security: SecurityRoutes = useSecurityRoutes()
  const authentication: AuthRoutes = useAuthRoutes()

  return {
    security,
    authentication,
  }
}
