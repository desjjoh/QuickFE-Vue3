import axios, { type AxiosInstance } from 'axios'

import { second } from '@/helpers/time'

import { useAuthRoutes, type AuthRoutes } from './routes/useAuthRoutes'
import { useAppRoutes, type AppRoutes } from './routes/useAppRoutes'

export const instance: AxiosInstance = axios.create({
  baseURL: 'https://localhost:4000/',
  timeout: 10 * second,
  headers: { ['Content-Type']: 'application/json' },
})

export interface LocalHostAPI {
  application: AppRoutes
  authentication: AuthRoutes
}

export function useLocalHostAPI(): LocalHostAPI {
  const application: AppRoutes = useAppRoutes()
  const authentication: AuthRoutes = useAuthRoutes()

  return {
    application,
    authentication,
  }
}
