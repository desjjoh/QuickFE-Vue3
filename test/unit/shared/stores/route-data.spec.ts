import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { reactive } from 'vue'
import { useRouteDataStore, prepareRouteData } from '@/shared/stores/route-data'
import type { DataRoute } from '@/router/route-data'
import { RoleKey, UserAdministrationPermissions } from '@/config/permissions'

const auth = reactive({
  $sessionKey: 'session-one',
  isAuthenticated: true,
  user: { id: 'one' } as { id: string } | null,
  hasRequiredRole: vi.fn(() => true),
  canActivate: vi.fn(() => true),
})
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => auth }))

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function makeRoute(fullPath = '/profile/account'): DataRoute {
  return {
    fullPath,
    query: {},
    meta: {
      requiresAuth: true,
      dataLoader: {
        load: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
        error: vi.fn(() => null),
      },
    },
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  auth.$sessionKey = 'session-one'
  auth.isAuthenticated = true
  auth.user = { id: 'one' }
  auth.hasRequiredRole.mockReturnValue(true)
  auth.canActivate.mockReturnValue(true)
})

describe('route data preparation', () => {
  it('skips guests and forbidden routes without marking them prepared', async () => {
    const store = useRouteDataStore()
    const route = makeRoute()
    auth.isAuthenticated = false
    expect(await store.prepare(route)).toBe(false)
    auth.isAuthenticated = true
    route.meta.requiredRoles = [RoleKey.ADMINISTRATOR]
    auth.hasRequiredRole.mockReturnValue(false)
    expect(await store.prepare(route)).toBe(false)
    expect(route.meta.dataLoader!.load).not.toHaveBeenCalled()
    expect(store.isPrepared(route)).toBe(false)
  })

  it('shares pending work and reuses prepared data while normal entry forces a fresh load', async () => {
    const store = useRouteDataStore()
    const route = makeRoute()
    const wait = deferred()
    vi.mocked(route.meta.dataLoader!.load).mockReturnValue(wait.promise)
    const first = store.prepare(route)
    const second = store.prepare(route)
    store.cancelPending(route)
    await Promise.resolve()
    expect(route.meta.dataLoader!.load).toHaveBeenCalledTimes(1)
    expect(store.isPrepared(route)).toBe(false)
    wait.resolve()
    expect(await first).toBe(true)
    expect(await second).toBe(true)
    expect(await store.prepare(route)).toBe(true)
    expect(route.meta.dataLoader!.load).toHaveBeenCalledTimes(1)
    await prepareRouteData(route)
    expect(route.meta.dataLoader!.load).toHaveBeenCalledTimes(2)
    vi.mocked(route.meta.dataLoader!.load).mockRejectedValueOnce(new Error('reload failed'))
    await prepareRouteData(route)
    expect(store.isPrepared(route)).toBe(false)
  })

  it.each(['rejected', 'store-error', 'non-error'])(
    'retains %s as a retryable failure rather than readiness',
    async (kind) => {
      const store = useRouteDataStore()
      const route = makeRoute()
      if (kind === 'store-error') vi.mocked(route.meta.dataLoader!.error).mockReturnValue('failed')
      else
        vi.mocked(route.meta.dataLoader!.load).mockRejectedValue(
          kind === 'non-error' ? 'failed' : new Error('failed'),
        )
      expect(await store.prepare(route)).toBe(false)
      expect(store.error?.message).toBe('failed')
      expect(store.errorKey).toBe(store.keyFor(route))
      expect(store.isPrepared(route)).toBe(false)
      vi.mocked(route.meta.dataLoader!.load).mockResolvedValue(undefined)
      vi.mocked(route.meta.dataLoader!.error).mockReturnValue(null)
      expect(await store.prepare(route)).toBe(true)
      expect(store.error).toBeUndefined()
    },
  )

  it.each(['logout', 'account', 'cancel'])(
    'invalidates %s before a late response can prepare the route',
    async (change) => {
      const store = useRouteDataStore()
      const route = makeRoute()
      const wait = deferred()
      vi.mocked(route.meta.dataLoader!.load).mockReturnValue(wait.promise)
      const result = store.prepare(route)
      await Promise.resolve()
      if (change === 'logout') auth.isAuthenticated = false
      else if (change === 'account') auth.user = { id: 'two' }
      else store.cancelPending()
      wait.resolve()
      expect(await result).toBe(false)
      expect(store.isPrepared(route)).toBe(false)
      expect(route.meta.dataLoader!.clear).toHaveBeenCalledOnce()
    },
  )

  it('invalidates readiness and pending work when only the session UUID changes', async () => {
    const store = useRouteDataStore()
    const route = makeRoute()
    await store.prepare(route)
    const key = store.keyFor(route)
    const wait = deferred()
    vi.mocked(route.meta.dataLoader!.load).mockReturnValueOnce(wait.promise)
    const pending = store.prepare(route, true)
    await Promise.resolve()
    auth.$sessionKey = 'replacement-session'
    expect(store.keyFor(route)).not.toBe(key)
    expect(store.isPrepared(route)).toBe(false)
    wait.resolve()
    expect(await pending).toBe(false)
    expect(route.meta.dataLoader!.clear).toHaveBeenCalledOnce()
    vi.mocked(route.meta.dataLoader!.load).mockResolvedValueOnce(undefined)
    expect(await store.prepare(route)).toBe(true)
  })
  it('does not start canceled work or let an older failure overwrite a newer preparation', async () => {
    const store = useRouteDataStore()
    const oldRoute = makeRoute('/old')
    const old = store.prepare(oldRoute)
    store.cancelPending()
    expect(await old).toBe(false)
    expect(oldRoute.meta.dataLoader!.load).not.toHaveBeenCalled()
    const wait = deferred()
    vi.mocked(oldRoute.meta.dataLoader!.load).mockImplementation(async () => {
      await wait.promise
      throw new Error('late')
    })
    const stale = store.prepare(oldRoute)
    await Promise.resolve()
    const next = makeRoute('/next')
    expect(await store.prepare(next)).toBe(true)
    wait.resolve()
    expect(await stale).toBe(false)
    expect(store.isPrepared(next)).toBe(true)
    expect(store.error).toBeUndefined()
  })

  it('checks permissions again after loading and separates query/account keys', async () => {
    const store = useRouteDataStore()
    const route = makeRoute('/users?page=2')
    route.meta.requiredPermissions = [UserAdministrationPermissions.READ_USERS]
    vi.mocked(route.meta.dataLoader!.load).mockImplementation(async () => {
      auth.canActivate.mockReturnValue(false)
    })
    expect(await store.prepare(route)).toBe(false)
    auth.canActivate.mockReturnValue(true)
    vi.mocked(route.meta.dataLoader!.load).mockResolvedValue(undefined)
    expect(await store.prepare(route)).toBe(true)
    expect(store.isPrepared({ ...route, fullPath: '/users?page=3' })).toBe(false)
    store.cancelPending()
    expect(store.isPrepared(route)).toBe(true)
    store.invalidate()
    expect(store.isPrepared(route)).toBe(false)
    expect(await store.prepare({ ...route, meta: {} })).toBe(true)
  })
})
