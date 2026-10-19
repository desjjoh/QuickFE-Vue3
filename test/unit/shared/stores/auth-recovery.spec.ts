import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AxiosError, type AxiosInstance } from 'axios'
import { flushPromises } from '@vue/test-utils'
import { buildUser } from '@test/support/fixtures'
import { deferred, useTestClock } from '@test/support/async'
import { JwtResponseDto } from '@/library/models/token'

let auth: ReturnType<typeof import('@/shared/stores/auth').useAuthStore>
let instance: AxiosInstance
let requestConfig: typeof import('@/shared/helpers/request').AxiosService.requestConfig
let refreshes: number
let revoked: boolean
let rejectReplay: boolean
let pendingRefresh: Promise<ReturnType<typeof credentials>> | undefined
let delayedResponse: Promise<void> | undefined
const attempts: { url?: string; authorization: unknown; data: unknown; key: unknown }[] = []
const now = () => Date.now() / 1000
const credentials = (token: string) => ({
  access_token: token,
  iat: now(),
  exp: now() + 100,
  refresh: now() + 200,
  user: buildUser(),
})

beforeEach(async () => {
  vi.resetModules()
  useTestClock()
  setActivePinia(createPinia())
  vi.stubGlobal(
    'BroadcastChannel',
    class {
      postMessage = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
    },
  )
  instance = (await import('@/shared/api/useLocalhostAPI')).instance
  const { useAuthStore } = await import('@/shared/stores/auth')
  auth = useAuthStore()
  auth.authenticate(new JwtResponseDto(credentials('old-access')))
  requestConfig = (await import('@/shared/helpers/request')).AxiosService.requestConfig
  const { useSessionInterceptor } = await import('@/shared/hooks/useSessionInterceptor')
  useSessionInterceptor()
  refreshes = 0
  revoked = false
  rejectReplay = false
  pendingRefresh = undefined
  delayedResponse = undefined
  attempts.length = 0
  instance.defaults.adapter = async (config) => {
    if (config.url === 'security/csrf')
      return {
        data: { token: 'csrf', iat: now(), exp: now() + 100 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    if (config.url === 'authentication/refresh') {
      refreshes++
      if (!revoked)
        return {
          data: await (pendingRefresh ?? Promise.resolve(credentials('fresh-access'))),
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
    } else {
      attempts.push({
        url: config.url,
        authorization: config.headers.get('Authorization'),
        data: config.data,
        key: config.headers.get('Idempotency-Key'),
      })
      if (config.headers.get('Authorization') === 'Bearer fresh-access' && !rejectReplay)
        return { data: [], status: 200, statusText: 'OK', headers: {}, config }
      if (config.url === 'account/profile/phone' && delayedResponse) await delayedResponse
    }
    throw new AxiosError('Session expired', 'ERR_BAD_REQUEST', config, undefined, {
      data: { message: 'Session expired' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config,
    })
  }
})

describe('real auth store and interceptor recovery', () => {
  it('preserves authentication after a lost-tab refresh timeout and succeeds on retry', async () => {
    const key = auth.$sessionKey
    localStorage.setItem(
      'quickfe_auth_refresh_lock',
      JSON.stringify({
        owner: 'closed-tab',
        operationId: 'lost-refresh',
        sessionKey: key,
        expiresAt: Date.now() + 15000,
      }),
    )
    const pending = instance.get('account/sessions', requestConfig({ token: 'old-access' }))
    const rejection = expect(pending).rejects.toThrow('Timed out')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(15000)
    await rejection
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.$sessionKey).toBe(key)
    expect(auth.$access_token!.token).toBe('old-access')
    expect(refreshes).toBe(0)
    await expect(
      instance.get('account/sessions', requestConfig({ token: 'old-access' })),
    ).resolves.toMatchObject({ data: [] })
    expect(auth.$access_token!.token).toBe('fresh-access')
    expect(refreshes).toBe(1)
  })
  it('coalesces real concurrent refreshes while preserving individual mutation payloads and keys', async () => {
    const response = deferred<ReturnType<typeof credentials>>()
    pendingRefresh = response.promise
    const send = (id: string) =>
      instance.patch(
        `administration/users/${id}`,
        { expected_version: 7, id },
        requestConfig({ token: 'old-access', idempotencyKey: id }),
      )
    const requests = ['one', 'two', 'three'].map(send)
    await flushPromises()
    expect(refreshes).toBe(1)
    response.resolve(credentials('fresh-access'))
    await Promise.all(requests)
    for (const id of ['one', 'two', 'three']) {
      const matching = attempts.filter((attempt) => attempt.url === `administration/users/${id}`)
      expect(matching).toHaveLength(2)
      expect(matching[0]).toMatchObject({ authorization: 'Bearer old-access', key: id })
      expect(matching[1]).toMatchObject({
        authorization: 'Bearer fresh-access',
        key: id,
        data: matching[0]!.data,
      })
    }
    expect(auth.isAuthenticated).toBe(true)
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
  })
  it('reuses an actual rotated token when an older unauthorized response arrives after refresh completed', async () => {
    const held = deferred<void>()
    delayedResponse = held.promise
    const delayed = instance.delete(
      'account/profile/phone',
      requestConfig({ token: 'old-access', idempotencyKey: 'delete-phone' }),
    )
    await instance.get('account/sessions', requestConfig({ token: 'old-access' }))
    expect(refreshes).toBe(1)
    held.resolve()
    await delayed
    expect(refreshes).toBe(1)
    expect(attempts.filter((attempt) => attempt.url === 'account/profile/phone')).toEqual([
      expect.objectContaining({ authorization: 'Bearer old-access', key: 'delete-phone' }),
      expect.objectContaining({ authorization: 'Bearer fresh-access', key: 'delete-phone' }),
    ])
    expect(auth.isAuthenticated).toBe(true)
  })
  it('refreshes expired access once for concurrent credential waiters', async () => {
    const key = auth.$sessionKey
    auth.$access_token!.exp = now()
    const tokens = await Promise.all([
      auth.getValidAccessToken(),
      auth.getValidAccessToken(),
      auth.getValidAccessToken(),
    ])
    expect(tokens).toEqual(['fresh-access', 'fresh-access', 'fresh-access'])
    expect(refreshes).toBe(1)
    expect(auth.$sessionKey).toBe(key)
  })
  it('stops after the replay is unauthorized without repeating refresh or dropping rotated credentials', async () => {
    rejectReplay = true
    await expect(
      instance.patch(
        'administration/users/one',
        { expected_version: 7 },
        requestConfig({ token: 'old-access', idempotencyKey: 'one' }),
      ),
    ).rejects.toMatchObject({ response: { status: 401 } })
    expect(refreshes).toBe(1)
    expect(attempts).toHaveLength(2)
    expect(attempts[1]).toMatchObject({
      key: 'one',
      data: attempts[0]!.data,
      authorization: 'Bearer fresh-access',
    })
    expect(auth.$access_token!.token).toBe('fresh-access')
    expect(auth.isAuthenticated).toBe(true)
  })
  it('purges authentication when its own refresh is rejected by the backend', async () => {
    revoked = true
    await expect(
      instance.get('account/sessions', requestConfig({ token: 'old-access' })),
    ).rejects.toMatchObject({ response: { status: 401 } })
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.$access_token).toBeNull()
    expect(localStorage.getItem('refresh_expiry')).toBeNull()
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
    expect(refreshes).toBe(1)
  })
})
