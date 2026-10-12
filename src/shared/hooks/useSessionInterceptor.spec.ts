import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'

const auth = vi.hoisted(() => ({
  verifyToken: vi.fn(),
  getValidAccessToken: vi.fn(),
  purgeStore: vi.fn(),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => auth }))

import { instance } from '@/shared/api/useLocalhostAPI'
import { AxiosService } from '@/shared/helpers/request'
import { useSessionInterceptor } from './useSessionInterceptor'

const originalAdapter = instance.defaults.adapter
const attempts: InternalAxiosRequestConfig[] = []
let status: number
let rejectRetry: boolean
const adapter: AxiosAdapter = async (config) => {
  attempts.push(config)
  if (attempts.length === 1 || rejectRetry) {
    throw new AxiosError('Request rejected', 'ERR_BAD_REQUEST', config, undefined, {
      data: { message: 'Request rejected' },
      status,
      statusText: 'Rejected',
      headers: {},
      config,
    })
  }
  return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
}

beforeAll(() => {
  useSessionInterceptor()
})
beforeEach(() => {
  attempts.length = 0
  status = 401
  rejectRetry = false
  vi.clearAllMocks()
  auth.verifyToken.mockResolvedValue(undefined)
  auth.getValidAccessToken.mockResolvedValue('new-access')
  instance.defaults.adapter = adapter
})
afterEach(() => {
  instance.defaults.adapter = originalAdapter
})

describe('protected API authentication recovery', () => {
  it.each(['administration/users/test', 'articles/me', 'articles/me/test'])(
    'retries %s once with the same serialized payload, version and idempotency key',
    async (url) => {
      await instance.patch(
        url,
        { expected_version: 7, reason_code: 'access_review' },
        AxiosService.idempotentRequestConfig({
          token: 'old-access',
          idempotencyKey: 'same-action',
        }),
      )
      expect(attempts).toHaveLength(2)
      expect(attempts[1]!.data).toBe(attempts[0]!.data)
      expect(attempts[1]!.headers.get('Idempotency-Key')).toBe('same-action')
      expect(attempts[1]!.headers.get('Authorization')).toBe('Bearer new-access')
      expect(auth.verifyToken).toHaveBeenCalledTimes(1)
      expect(auth.purgeStore).not.toHaveBeenCalled()
    },
  )

  it('retains the multipart upload and key across an account retry', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const data = new FormData()
    data.append('avatar', file)
    await instance.post(
      'account/profile/avatar',
      data,
      AxiosService.idempotentRequestConfig({
        token: 'old-access',
        csrfToken: 'csrf',
        withCredentials: true,
        contentType: 'multipart/form-data',
        idempotencyKey: 'avatar-action',
      }),
    )
    expect(attempts[1]!.data).toBe(data)
    expect(attempts[1]!.data.get('avatar')).toBe(file)
    expect(attempts[1]!.headers.get('Idempotency-Key')).toBe('avatar-action')
    expect(attempts[1]!.headers.get('X-CSRF-Token')).toBe('csrf')
    expect(attempts[1]!.withCredentials).toBe(true)
  })

  it.each([403, 409, 422, 429, 503])(
    'does not refresh or retry HTTP %s',
    async (rejectedStatus) => {
      status = rejectedStatus
      await expect(
        instance.patch(
          'administration/users/test',
          { expected_version: 7 },
          AxiosService.requestConfig({ token: 'access' }),
        ),
      ).rejects.toMatchObject({ response: { status } })
      expect(attempts).toHaveLength(1)
      expect(auth.verifyToken).not.toHaveBeenCalled()
      expect(auth.purgeStore).not.toHaveBeenCalled()
    },
  )

  it('does not refresh public requests, password reset, or requests that preserve the session', async () => {
    for (const [url, config] of [
      ['administration/users', AxiosService.requestConfig({})],
      ['articles/public', AxiosService.requestConfig({ token: 'access' })],
      ['authentication/password-reset/verify', AxiosService.requestConfig({})],
      [
        'account/password',
        AxiosService.requestConfig({ token: 'access', preserveSessionOnUnauthorized: true }),
      ],
    ] as const) {
      await expect(instance.post(url, {}, config)).rejects.toMatchObject({
        response: { status: 401 },
      })
      attempts.length = 0
    }
    expect(auth.verifyToken).not.toHaveBeenCalled()
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })

  it('purges the session if token refresh fails without replaying the mutation', async () => {
    const failure = new Error('Refresh rejected')
    auth.verifyToken.mockRejectedValueOnce(failure)
    await expect(
      instance.delete('account/profile/phone', AxiosService.requestConfig({ token: 'access' })),
    ).rejects.toBe(failure)
    expect(attempts).toHaveLength(1)
    expect(auth.purgeStore).toHaveBeenCalledTimes(1)
  })

  it('stops after a second unauthorized response', async () => {
    rejectRetry = true
    await expect(
      instance.delete('account/profile/phone', AxiosService.requestConfig({ token: 'access' })),
    ).rejects.toMatchObject({ response: { status: 401 } })
    expect(attempts).toHaveLength(2)
    expect(auth.verifyToken).toHaveBeenCalledTimes(1)
  })

  it('passes a conflict on the replay back to the caller without clearing the refreshed session', async () => {
    instance.defaults.adapter = async (config) => {
      attempts.push(config)
      const code = attempts.length === 1 ? 401 : 409
      throw new AxiosError('Rejected', 'ERR_BAD_REQUEST', config, undefined, {
        data: { message: 'Stale version' },
        status: code,
        statusText: 'Rejected',
        headers: {},
        config,
      })
    }
    await expect(
      instance.patch(
        'administration/users/test',
        { expected_version: 7 },
        AxiosService.idempotentRequestConfig({ token: 'access', idempotencyKey: 'edit-action' }),
      ),
    ).rejects.toMatchObject({ response: { status: 409 } })
    expect(attempts).toHaveLength(2)
    expect(attempts[1]!.headers.get('Idempotency-Key')).toBe('edit-action')
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })
})
