import axios, { type AxiosInstance } from 'axios'

import { second } from '@/shared/helpers/time'

import { useAuthRoutes, type AuthRoutes } from './routes/useAuthRoutes'
import { useSecurityRoutes, type SecurityRoutes } from './routes/useSecurityRoutes'
import { APP_ENV } from '@/config/env'
import { usePublicRoutes, type PublicRoutes } from './routes/usePublicRoutes'
import { useAccountRoutes, type AccountRoutes } from './routes/useAccountRoutes'
import {
  useAdministrationRoutes,
  type AdministrationRoutes,
} from './routes/useAdministrationRoutes'

export const instance: AxiosInstance = axios.create({
  baseURL: APP_ENV.API_BASE_URL,
  timeout: 10 * second,
})

export interface LocalHostAPI {
  security: SecurityRoutes
  authentication: AuthRoutes
  public: PublicRoutes
  account: AccountRoutes
  administration: AdministrationRoutes
}

export function useLocalHostAPI(): LocalHostAPI {
  const security: SecurityRoutes = useSecurityRoutes()
  const authentication: AuthRoutes = useAuthRoutes()
  const publicRoutes: PublicRoutes = usePublicRoutes()
  const account: AccountRoutes = useAccountRoutes()
  const administration: AdministrationRoutes = useAdministrationRoutes()

  return {
    security,
    authentication,
    public: publicRoutes,
    account,
    administration,
  }
}
