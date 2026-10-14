import { describe, expect, it, vi } from 'vitest'

describe('frontend API base URL configuration', () => {
  it.each([
    [undefined, 'https://localhost:4000/api/v1'],
    ['', 'https://localhost:4000/api/v1'],
    ['   ', 'https://localhost:4000/api/v1'],
    [' https://api.example.test/api/v1/ ', 'https://api.example.test/api/v1'],
  ])(
    'normalizes configured value %s and uses the local default when absent',
    async (configured, expected) => {
      vi.resetModules()
      vi.stubEnv('VITE_API_BASE_URL', configured)
      const { API_BASE_URL, APP_ENV } = await import('@/config/env')
      expect(API_BASE_URL).toBe(expected)
      expect(APP_ENV.API_BASE_URL).toBe(expected)
    },
  )
})
