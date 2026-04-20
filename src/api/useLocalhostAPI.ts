import axios, { type AxiosInstance } from 'axios'

import { second } from '@/helpers/time'

import { useAuthRoutes, type AuthRoutes } from './routes/useAuthRoutes'
import { useSettingsRoutes, type SettingsRoutes } from './routes/useSettingsRoutes'

export const instance: AxiosInstance = axios.create({
  baseURL: 'https://localhost:3000/api/',
  timeout: 10 * second,
  headers: { ['Content-Type']: 'application/json' },
})

export interface LocalHostAPI {
  authentication: AuthRoutes
  settings: SettingsRoutes
}

export function useLocalHostAPI(): LocalHostAPI {
  const authentication: AuthRoutes = useAuthRoutes()
  const settings: SettingsRoutes = useSettingsRoutes()

  return {
    authentication,
    settings,
  }
}
