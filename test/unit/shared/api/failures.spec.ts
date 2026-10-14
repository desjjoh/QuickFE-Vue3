import { afterEach, describe, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import { instance, useLocalHostAPI } from '@/shared/api/useLocalhostAPI'

const original = instance.defaults.adapter
afterEach(() => {
  instance.defaults.adapter = original
})
const calls = () => {
  const api = useLocalHostAPI()
  return [
    () => api.security.csrfToken(),
    () => api.library.getCountries(),
    () => api.sessions.list('access', 'csrf'),
    () => api.administration.audits.detail('access', 'id'),
    () => api.articles.public.list({}),
    () =>
      api.account.changePassword('access', 'csrf', {
        password: 'old',
        new_password: 'new',
        confirm: 'new',
      }),
  ]
}
describe('API failure propagation across domains', () => {
  it.each([401, 403, 404, 409, 422, 429, 500])(
    'preserves HTTP %i and backend error details without returning DTOs',
    async (status) => {
      const payload = { message: 'Rejected', code: 'contract_error' }
      instance.defaults.adapter = async (config) => {
        throw new AxiosError('Rejected', 'ERR_BAD_REQUEST', config, undefined, {
          data: payload,
          status,
          statusText: 'Rejected',
          headers: {},
          config,
        })
      }
      for (const call of calls())
        await expect(call()).rejects.toMatchObject({ response: { status, data: payload } })
    },
  )
  it('propagates network failures and rejects invalid response contracts', async () => {
    const error = new Error('offline')
    instance.defaults.adapter = async () => {
      throw error
    }
    for (const call of calls()) await expect(call()).rejects.toBe(error)
    instance.defaults.adapter = async (config) => ({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
    await expect(useLocalHostAPI().library.getCountries()).rejects.toThrow()
  })
})
