import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useAuthStore } from './auth'
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
    mocks.refresh.mockRejectedValueOnce(new Error('refresh denied'))
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
