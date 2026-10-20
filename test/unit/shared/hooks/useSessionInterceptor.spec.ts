import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'

const auth = vi.hoisted(() => ({
  $sessionKey: 'session-one',
  user: { id: 'original' },
  $access_token: { token: 'original-token', exp: 0 },
  isCurrentSession: vi.fn(),
  verifyToken: vi.fn(),
  getValidAccessToken: vi.fn(),
  purgeStore: vi.fn(),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => auth }))

import { instance } from '@/shared/api/useLocalhostAPI'
import { AxiosService } from '@/shared/helpers/request'
import { useSessionInterceptor } from '@/shared/hooks/useSessionInterceptor'
import { SessionChangedError } from '@/shared/helpers/session-scope'
import { deferred } from '@test/support/async'
import { flushPromises } from '@vue/test-utils'

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
  auth.user.id = 'original'
  auth.$sessionKey = 'session-one'
  auth.$access_token.token = 'original-token'
  auth.$access_token.exp = 0
  auth.isCurrentSession.mockImplementation((key: string) => key === auth.$sessionKey)
  auth.verifyToken.mockResolvedValue(undefined)
  auth.getValidAccessToken.mockResolvedValue('new-access')
  instance.defaults.adapter = adapter
})
afterEach(() => {
  instance.defaults.adapter = originalAdapter
})

describe('protected API authentication recovery', () => {
  it('reuses a valid rotated token for staggered 401s without repeating refresh or changing mutations', async () => {
    const delayed = deferred<void>()
    const headers: string[] = []
    auth.verifyToken.mockImplementationOnce(async () => {
      auth.$access_token = { token: 'new-access', exp: Date.now() / 1000 + 100 }
    })
    instance.defaults.adapter = async (config) => {
      attempts.push(config)
      const header = String(config.headers.get('Authorization'))
      headers.push(header)
      if (header === 'Bearer original-token') {
        if (!config.url!.endsWith('first')) await delayed.promise
        throw new AxiosError('old credential', 'ERR_BAD_REQUEST', config, undefined, {
          data: {},
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
        })
      }
      return { data: config.data, status: 200, statusText: 'OK', headers: {}, config }
    }
    const send = (id: string) =>
      instance.patch(
        `administration/users/${id}`,
        { expected_version: 3, id },
        AxiosService.requestConfig({ token: 'original-token', idempotencyKey: id }),
      )
    const first = send('first')
    const second = send('second')
    const third = send('third')
    await first
    expect(auth.verifyToken).toHaveBeenCalledOnce()
    delayed.resolve()
    await Promise.all([second, third])
    expect(auth.verifyToken).toHaveBeenCalledOnce()
    expect(headers.filter((header) => header === 'Bearer new-access')).toHaveLength(3)
    for (const id of ['first', 'second', 'third']) {
      const matching = attempts.filter((config) => config.url!.endsWith(id))
      expect(matching).toHaveLength(2)
      expect(matching[1]!.data).toBe(matching[0]!.data)
      expect(matching[1]!.headers.get('Idempotency-Key')).toBe(id)
    }
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })
  it('still refreshes when a valid cached token is the same credential the server rejected', async () => {
    auth.$access_token.exp = Date.now() / 1000 + 100
    await instance.get('account/sessions', AxiosService.requestConfig({ token: 'original-token' }))
    expect(auth.verifyToken).toHaveBeenCalledOnce()
    expect(attempts).toHaveLength(2)
  })
  it('does not loop or refresh when a newer valid credential also receives 401', async () => {
    auth.$access_token.exp = Date.now() / 1000 + 100
    rejectRetry = true
    await expect(
      instance.get('account/sessions', AxiosService.requestConfig({ token: 'older-token' })),
    ).rejects.toMatchObject({ response: { status: 401 } })
    expect(auth.verifyToken).not.toHaveBeenCalled()
    expect(auth.purgeStore).not.toHaveBeenCalled()
    expect(attempts).toHaveLength(2)
  })
  it('does not reuse a different credential at its exact expiry', async () => {
    auth.$access_token.exp = Date.now() / 1000
    await instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' }))
    expect(auth.verifyToken).toHaveBeenCalledOnce()
  })
  it('can recover when there is no cached access token', async () => {
    const previous = auth.$access_token
    Object.assign(auth, { $access_token: null })
    try {
      await instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' }))
      expect(auth.verifyToken).toHaveBeenCalledOnce()
    } finally {
      auth.$access_token = previous
    }
  })
  it('rejects credentials when shared ownership changed before the local broadcast arrives', async () => {
    auth.isCurrentSession.mockReturnValue(false)
    await expect(
      instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' })),
    ).rejects.toBeInstanceOf(SessionChangedError)
    expect(attempts).toHaveLength(0)
    expect(auth.verifyToken).not.toHaveBeenCalled()
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })
  it.each([false, true])(
    'rejects an already-owned stale request before dispatch (retry=%s)',
    async (retried) => {
      const config = {
        ...AxiosService.requestConfig({ token: 'old' }),
        __quickfeAuthUserId: 'original',
        __quickfeAuthSessionKey: 'session-one',
        __quickfeAuthRetried: retried,
      }
      auth.$sessionKey = 'session-two'
      await expect(instance.delete('account/profile/phone', config)).rejects.toBeInstanceOf(
        SessionChangedError,
      )
      expect(attempts).toHaveLength(0)
      expect(auth.verifyToken).not.toHaveBeenCalled()
      expect(auth.purgeStore).not.toHaveBeenCalled()
    },
  )
  it('rejects a retry that lost its originating session instead of assigning a new owner', async () => {
    const config = {
      ...AxiosService.requestConfig({ token: 'old' }),
      __quickfeAuthRetried: true,
    }
    await expect(instance.get('account/sessions', config)).rejects.toBeInstanceOf(
      SessionChangedError,
    )
    expect(attempts).toHaveLength(0)
    expect(auth.verifyToken).not.toHaveBeenCalled()
  })
  it('captures ownership synchronously at request invocation', async () => {
    const wait = deferred<void>()
    instance.defaults.adapter = async (config) => {
      attempts.push(config)
      await wait.promise
      return { data: { private: 'A' }, status: 200, statusText: 'OK', headers: {}, config }
    }
    const pending = instance.get('account/activity', AxiosService.requestConfig({ token: 'old' }))
    // No microtask is allowed to assign the replacement session to this request.
    auth.$sessionKey = 'session-two'
    wait.resolve()
    await expect(pending).rejects.toBeInstanceOf(SessionChangedError)
    expect(attempts).toHaveLength(1)
    expect(attempts[0]).toMatchObject({ __quickfeAuthSessionKey: 'session-one' })
  })
  it('treats session cancellation during recovery as cancellation, preserving active credentials', async () => {
    auth.verifyToken.mockRejectedValueOnce(new SessionChangedError())
    await expect(
      instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' })),
    ).rejects.toBeInstanceOf(SessionChangedError)
    expect(auth.purgeStore).not.toHaveBeenCalled()
    expect(attempts).toHaveLength(1)
  })
  it.each(['different-account', 'same-account-new-session'])(
    'rejects a late successful response after %s without passing its data to callers',
    async (change) => {
      const wait = deferred<void>()
      instance.defaults.adapter = async (config) => {
        attempts.push(config)
        await wait.promise
        return {
          data: { private: 'account A' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }
      const pending = instance.get(
        'account/activity',
        AxiosService.requestConfig({ token: 'access' }),
      )
      await flushPromises()
      if (change === 'different-account') auth.user.id = 'other'
      auth.$sessionKey = 'session-two'
      wait.resolve()
      await expect(pending).rejects.toThrow('Session changed while the request was pending')
      expect(auth.verifyToken).not.toHaveBeenCalled()
      expect(auth.purgeStore).not.toHaveBeenCalled()
    },
  )

  it.each([401, 422])(
    'discards an old session HTTP %s after logout and same-account sign-in',
    async (status) => {
      const wait = deferred<void>()
      instance.defaults.adapter = async (config) => {
        attempts.push(config)
        await wait.promise
        throw new AxiosError('expired', 'ERR_BAD_REQUEST', config, undefined, {
          data: {},
          status,
          statusText: 'Unauthorized',
          headers: {},
          config,
        })
      }
      const pending = instance.get(
        'account/activity',
        AxiosService.requestConfig({ token: 'access' }),
      )
      await flushPromises()
      auth.$sessionKey = 'session-two'
      wait.resolve()
      await expect(pending).rejects.toThrow('Session changed while the request was pending')
      expect(auth.verifyToken).not.toHaveBeenCalled()
    },
  )
  it('does not install twice or refresh a root URL request', async () => {
    useSessionInterceptor()
    await expect(
      instance.get('/', AxiosService.requestConfig({ token: 'access' })),
    ).rejects.toMatchObject({ response: { status: 401 } })
    expect(auth.verifyToken).not.toHaveBeenCalled()
  })
  it('handles protected callers without a cached user identity', async () => {
    const user = auth.user
    Object.assign(auth, { user: null })
    try {
      await instance.get('account/sessions', AxiosService.requestConfig({ token: 'access' }))
      expect(attempts).toHaveLength(2)
      expect(auth.verifyToken).toHaveBeenCalledOnce()
    } finally {
      Object.assign(auth, { user })
    }
  })
  it('handles failed recovery without a cached user identity', async () => {
    const user = auth.user
    Object.assign(auth, { user: null })
    auth.verifyToken.mockRejectedValueOnce(new Error('refresh denied'))
    try {
      await expect(
        instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' })),
      ).rejects.toThrow('refresh denied')
      expect(auth.purgeStore).toHaveBeenCalledOnce()
    } finally {
      Object.assign(auth, { user })
    }
  })
  it('does not refresh or replay an old account request whose unauthorized response arrives after a switch', async () => {
    const response = deferred<void>()
    instance.defaults.adapter = async (config) => {
      attempts.push(config)
      await response.promise
      throw new AxiosError('old account expired', 'ERR_BAD_REQUEST', config, undefined, {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      })
    }
    const pending = instance.delete(
      'account/profile/phone',
      AxiosService.requestConfig({ token: 'old' }),
    )
    const rejected = expect(pending).rejects.toThrow(
      'Session changed while the request was pending',
    )
    await flushPromises()
    auth.user.id = 'different'
    auth.$access_token.token = 'replacement'
    response.resolve()
    await rejected
    expect(attempts).toHaveLength(1)
    expect(auth.verifyToken).not.toHaveBeenCalled()
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })
  it.each([true, false])(
    'does not replay or purge a different account after refresh settles (success=%s)',
    async (success) => {
      const refreshing = deferred<void>()
      auth.verifyToken.mockReturnValueOnce(refreshing.promise)
      const pending = instance.patch(
        'administration/users/one',
        { expected_version: 1 },
        AxiosService.requestConfig({ token: 'old' }),
      )
      const assertion = expect(pending).rejects.toThrow(success ? 'Session changed' : 'expired')
      await flushPromises()
      auth.user.id = 'different'
      auth.$access_token.token = 'different-token'
      if (success) refreshing.resolve()
      else refreshing.reject(new Error('expired'))
      await assertion
      expect(attempts).toHaveLength(1)
      expect(auth.purgeStore).not.toHaveBeenCalled()
    },
  )
  it('does not purge replacement credentials for the same account after an old refresh fails', async () => {
    auth.verifyToken.mockImplementationOnce(async () => {
      auth.$access_token.token = 'replacement'
      throw new Error('old refresh')
    })
    await expect(
      instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' })),
    ).rejects.toThrow('old refresh')
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })
  it('keeps concurrent protected requests and their operation keys separate during recovery', async () => {
    const refreshing = deferred<void>()
    auth.verifyToken.mockReturnValue(refreshing.promise)
    const seen = new Set<string>()
    instance.defaults.adapter = async (config) => {
      attempts.push(config)
      if (!seen.has(config.url!)) {
        seen.add(config.url!)
        throw new AxiosError('expired', 'ERR_BAD_REQUEST', config, undefined, {
          data: {},
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
        })
      }
      return { data: config.data, status: 200, statusText: 'OK', headers: {}, config }
    }
    const requests = ['one', 'two'].map((id) =>
      instance.patch(
        `administration/users/${id}`,
        { id, expected_version: 1 },
        AxiosService.requestConfig({ token: 'old', idempotencyKey: id }),
      ),
    )
    await flushPromises()
    expect(attempts).toHaveLength(2)
    refreshing.resolve()
    await Promise.all(requests)
    expect(attempts).toHaveLength(4)
    for (const id of ['one', 'two']) {
      const matching = attempts.filter((request) => request.url?.endsWith(id))
      expect(matching[1]!.data).toBe(matching[0]!.data)
      expect(matching[1]!.headers.get('Idempotency-Key')).toBe(id)
    }
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })
  it('purges when token retrieval fails after refresh without replaying', async () => {
    auth.getValidAccessToken.mockRejectedValue(new Error('missing token'))
    await expect(
      instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' })),
    ).rejects.toThrow('missing token')
    expect(attempts).toHaveLength(1)
    expect(auth.purgeStore).toHaveBeenCalledOnce()
  })
  it('passes network failures through without refreshing or purging', async () => {
    const failure = new Error('network unavailable')
    instance.defaults.adapter = async () => {
      throw failure
    }
    await expect(
      instance.get('account/sessions', AxiosService.requestConfig({ token: 'old' })),
    ).rejects.toBe(failure)
    expect(auth.verifyToken).not.toHaveBeenCalled()
    expect(auth.purgeStore).not.toHaveBeenCalled()
  })
  it.each(['administration/users/test', 'articles', 'articles/test', 'articles/test/submit'])(
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
      ['public/articles', AxiosService.requestConfig({ token: 'access' })],
      ['public/articles/test', AxiosService.requestConfig({ token: 'access' })],
      ['public/library/countries', AxiosService.requestConfig({ token: 'access' })],
      ['articles-other', AxiosService.requestConfig({ token: 'access' })],
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
