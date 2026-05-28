const DEFAULT_LOCAL_API_BASE_URL = 'https://localhost:4000/api/v1'

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '')
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = normalizeBaseUrl(
  configuredApiBaseUrl && configuredApiBaseUrl.trim().length > 0
    ? configuredApiBaseUrl
    : DEFAULT_LOCAL_API_BASE_URL,
)

export const APP_ENV = {
  API_BASE_URL,
} as const
