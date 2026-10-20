import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { AxiosError } from 'axios'
import { flushPromises } from '@vue/test-utils'
import { useAuthStore } from '@/shared/stores/auth'
import { JwtResponseDto, CsrfTokenDto } from '@/library/models/token'
import { buildUser } from '@test/support/fixtures'
import { deferred, useTestClock } from '@test/support/async'
import { AuditPermissions, RoleKey, SystemPermissions } from '@/config/permissions'

const mocks = vi.hoisted(() => ({ csrf: vi.fn(), refresh: vi.fn() }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({
    security: { csrfToken: mocks.csrf },
    authentication: { verifyToken: mocks.refresh },
  }),
}))
beforeEach(() => {
  vi.resetAllMocks()
  useTestClock()
  vi.stubGlobal(
    'BroadcastChannel',
    class {
      postMessage = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
      close = vi.fn()
    },
  )
  const now = Date.now() / 1000
  mocks.csrf.mockResolvedValue(new CsrfTokenDto({ token: 'csrf', iat: now, exp: now + 100 }))
  mocks.refresh.mockResolvedValue(
    new JwtResponseDto({
      access_token: 'new',
      iat: now,
      exp: now + 100,
      refresh: now + 200,
      user: buildUser(),
    }),
  )
})

describe('authentication store and API coordination', () => {
  it.each(['broadcast', 'token update', 'logout'])(
    'checks ownership and newer credentials after waiting for the browser lock: %s',
    async (change) => {
      const store = useAuthStore(createPinia())
      const acquired = deferred<void>()
      vi.stubGlobal('navigator', {
        locks: {
          request: async (_name: string, work: () => Promise<void>) => {
            await acquired.promise
            return work()
          },
        },
      })
      const refreshing = store.verifyToken()
      const assertion =
        change === 'logout'
          ? expect(refreshing).rejects.toThrow('Session changed')
          : expect(refreshing).resolves.toBeUndefined()
      const now = Date.now() / 1000
      if (change === 'broadcast')
        store.authenticate(
          new JwtResponseDto({
            access_token: 'peer',
            iat: now,
            exp: now + 100,
            refresh: now + 200,
            user: buildUser(),
          }),
          { newSession: false },
        )
      else if (change === 'token update')
        store.$access_token = { token: 'peer', iat: now, exp: now + 100 }
      else store.purgeStore()
      acquired.resolve()
      await assertion
      expect(mocks.refresh).not.toHaveBeenCalled()
    },
  )
  it('serializes refresh rotation across independent stores sharing the same browser cookie', async () => {
    let tail: Promise<unknown> = Promise.resolve()
    vi.stubGlobal('navigator', {
      locks: {
        request: (_name: string, work: () => Promise<void>) => {
          const current = tail.catch(() => undefined).then(work)
          tail = current
          return current
        },
      },
    })
    const first = useAuthStore(createPinia())
    await first.getValidCsrfToken()
    const second = useAuthStore(createPinia())
    const pending = deferred<JwtResponseDto>()
    mocks.refresh.mockReturnValueOnce(pending.promise)
    const one = first.verifyToken()
    const two = second.verifyToken()
    await flushPromises()
    expect(mocks.refresh).toHaveBeenCalledOnce()
    const now = Date.now() / 1000
    pending.resolve(
      new JwtResponseDto({
        access_token: 'first',
        iat: now,
        exp: now + 100,
        refresh: now + 200,
        user: buildUser(),
      }),
    )
    await Promise.all([one, two])
    expect(mocks.refresh).toHaveBeenCalledTimes(2)
    expect(first.isAuthenticated).toBe(true)
    expect(second.isAuthenticated).toBe(true)
  })
  it.each(['rejection', 'csrf renewal'])(
    'preserves newer same-session credentials during CSRF %s',
    async (phase) => {
      const store = useAuthStore(createPinia())
      const now = Date.now() / 1000
      const newer = new JwtResponseDto({
        access_token: 'newer',
        iat: now,
        exp: now + 100,
        refresh: now + 200,
        user: buildUser(),
      })
      const failure = new AxiosError('csrf rejected', undefined, undefined, undefined, {
        status: 403,
      } as never)
      if (phase === 'rejection') {
        mocks.refresh.mockImplementationOnce(async () => {
          store.authenticate(newer, { newSession: false })
          throw failure
        })
      } else {
        mocks.refresh.mockRejectedValueOnce(failure)
        vi.spyOn(store, 'getValidCsrfToken')
          .mockResolvedValueOnce('first')
          .mockImplementationOnce(async () => {
            store.authenticate(newer, { newSession: false })
            return 'fresh'
          })
      }
      await expect(store.verifyToken()).rejects.toThrow('Session changed')
      expect(mocks.refresh).toHaveBeenCalledOnce()
      expect(store.$access_token!.token).toBe('newer')
      expect(store.isAuthenticated).toBe(true)
    },
  )
  it('still purges rejected refresh credentials after renewing CSRF', async () => {
    const store = useAuthStore(createPinia())
    for (const status of [403, 401])
      mocks.refresh.mockRejectedValueOnce(
        new AxiosError('rejected', undefined, undefined, undefined, { status } as never),
      )
    await expect(store.verifyToken()).rejects.toMatchObject({ response: { status: 401 } })
    expect(mocks.refresh).toHaveBeenCalledTimes(2)
    expect(mocks.csrf).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem('refresh_expiry')).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
  it('does not retry refresh if logout occurs while renewing the CSRF pair', async () => {
    const store = useAuthStore(createPinia())
    const pending = deferred<CsrfTokenDto>()
    mocks.csrf.mockResolvedValueOnce(new CsrfTokenDto({ token: 'first', iat: 0, exp: 1 }))
    mocks.csrf.mockReturnValueOnce(pending.promise)
    mocks.refresh.mockRejectedValueOnce(
      new AxiosError('csrf rejected', undefined, undefined, undefined, { status: 403 } as never),
    )
    const refreshing = store.verifyToken()
    const rejected = expect(refreshing).rejects.toThrow('Session changed')
    await flushPromises()
    store.purgeStore()
    pending.resolve(new CsrfTokenDto({ token: 'late', iat: 0, exp: 1 }))
    await rejected
    expect(mocks.refresh).toHaveBeenCalledOnce()
    expect(store.isAuthenticated).toBe(false)
    expect(store.$csrf_token).toBeNull()
  })
  it('coalesces CSRF requests, caches valid tokens and refreshes at the expiry boundary', async () => {
    const store = useAuthStore(createPinia())
    const pending = deferred<CsrfTokenDto>()
    mocks.csrf.mockReturnValueOnce(pending.promise)
    const first = store.getValidCsrfToken()
    const second = store.getValidCsrfToken()
    expect(mocks.csrf).toHaveBeenCalledOnce()
    const now = Date.now() / 1000
    pending.resolve(new CsrfTokenDto({ token: 'first', iat: now, exp: now + 1 }))
    expect(await Promise.all([first, second])).toEqual(['first', 'first'])
    await store.getValidCsrfToken()
    expect(mocks.csrf).toHaveBeenCalledOnce()
    vi.setSystemTime(Date.now() + 1000)
    await store.getValidCsrfToken()
    expect(mocks.csrf).toHaveBeenCalledTimes(2)
  })
  it('releases failed CSRF requests so retry can succeed', async () => {
    const store = useAuthStore(createPinia())
    mocks.csrf.mockRejectedValueOnce(new Error('csrf unavailable'))
    await expect(store.getValidCsrfToken()).rejects.toThrow('csrf unavailable')
    expect(await store.getValidCsrfToken()).toBe('csrf')
  })
  it('coalesces simultaneous refreshes and retains rotated credentials and user models', async () => {
    const store = useAuthStore(createPinia())
    const pending = deferred<JwtResponseDto>()
    mocks.refresh.mockReturnValueOnce(pending.promise)
    const first = store.verifyToken()
    const second = store.verifyToken()
    await flushPromises()
    expect(mocks.refresh).toHaveBeenCalledOnce()
    const now = Date.now() / 1000
    pending.resolve(
      new JwtResponseDto({
        access_token: 'rotated',
        iat: now,
        exp: now + 60,
        refresh: now + 120,
        user: buildUser(),
      }),
    )
    await Promise.all([first, second])
    expect(await store.getValidAccessToken()).toBe('rotated')
    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
    expect(JSON.parse(localStorage.getItem('refresh_expiry')!)).toBe(now + 120)
  })
  it('clears authenticated data and locks on refresh rejection, then allows a fresh retry', async () => {
    const store = useAuthStore(createPinia())
    mocks.refresh.mockRejectedValueOnce(
      new AxiosError('refresh denied', undefined, undefined, undefined, { status: 401 } as never),
    )
    await expect(store.verifyToken()).rejects.toThrow('refresh denied')
    expect(store.isAuthenticated).toBe(false)
    expect(store.$access_token).toBeNull()
    expect(localStorage.getItem('quickfe_auth_refresh_lock')).toBeNull()
    await store.verifyToken()
    expect(store.isAuthenticated).toBe(true)
  })
  it('checks roles and scoped/all permissions without giving guests access', async () => {
    const store = useAuthStore(createPinia())
    expect(store.canActivate([AuditPermissions.READ_AUDIT_DETAIL])).toBe(false)
    const user = buildUser()
    user.roles = [
      {
        ...user.status,
        key: RoleKey.ADMINISTRATOR,
        description: null,
        permissions: [AuditPermissions.READ_AUDIT_DETAIL],
      },
    ]
    const now = Date.now() / 1000
    store.authenticate(
      new JwtResponseDto({ access_token: 'token', iat: now, exp: now + 1, refresh: now + 2, user }),
      { broadcast: false },
    )
    expect(store.hasRequiredRole([RoleKey.ADMINISTRATOR])).toBe(true)
    expect(store.hasRequiredRole([RoleKey.CREATOR])).toBe(false)
    expect(store.canActivate([AuditPermissions.SEARCH_AUDIT])).toBe(false)
    user.roles[0]!.permissions = [SystemPermissions.HAS_ALL_PERMISSIONS]
    store.authenticate(
      new JwtResponseDto({ access_token: 'token', iat: now, exp: now + 1, refresh: now + 2, user }),
      { broadcast: false },
    )
    expect(store.canActivate([AuditPermissions.SEARCH_AUDIT])).toBe(true)
    store.purgeStore({ broadcast: false })
    expect(store.user).toBeNull()
    expect(localStorage.getItem('refresh_expiry')).toBeNull()
  })
})
