import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { instance } from '@/shared/api/useLocalhostAPI'
import { userFixture } from '@test/support/api-fixtures'
import { UserAdministrationDto } from '@/library/models/administration'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import { deferred } from '@test/support/async'
import { flushPromises } from '@vue/test-utils'

const auth = vi.hoisted(() => ({
  isAuthenticated: true,
  user: { id: 'user' },
  canActivate: vi.fn(),
  getValidAccessToken: vi.fn(),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => auth }))
const original = instance.defaults.adapter
const request = vi.fn()
beforeEach(() => {
  setActivePinia(createPinia())
  request.mockClear()
  auth.isAuthenticated = true
  auth.user.id = 'user'
  auth.canActivate.mockReturnValue(true)
  auth.getValidAccessToken.mockResolvedValue('access')
  instance.defaults.adapter = async (config) => {
    request(config)
    return {
      data: {
        data: [{ ...userFixture, version: 9 }],
        meta: {
          page: 1,
          take: 10,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }
})
afterEach(() => {
  instance.defaults.adapter = original
})

describe('administration store contract integration', () => {
  it.each(['logout', 'permission', 'account'] as const)(
    'discards responses after %s',
    async (mode) => {
      const store = useAdministrationUsersStore()
      const response = deferred<void>()
      const adapter = instance.defaults.adapter as import('axios').AxiosAdapter
      instance.defaults.adapter = async (config) => {
        await response.promise
        return adapter(config)
      }
      const pending = store.loadUsers()
      await flushPromises()
      if (mode === 'logout') auth.isAuthenticated = false
      else if (mode === 'permission') auth.canActivate.mockReturnValue(false)
      else auth.user.id = 'different'
      response.resolve()
      await pending
      expect(store.users).toEqual([])
      expect(store.loading).toBe(false)
    },
  )
  it('blocks late credentials on cleanup or permission loss and recovers after credential rejection', async () => {
    const store = useAdministrationUsersStore()
    const token = deferred<string>()
    auth.getValidAccessToken.mockReturnValueOnce(token.promise)
    const pending = store.loadUsers()
    store.clear()
    token.resolve('access')
    await pending
    expect(request).not.toHaveBeenCalled()
    auth.getValidAccessToken.mockImplementationOnce(async () => {
      auth.canActivate.mockReturnValue(false)
      return 'access'
    })
    await store.loadUsers()
    expect(request).not.toHaveBeenCalled()
    auth.canActivate.mockReturnValue(true)
    auth.getValidAccessToken.mockRejectedValueOnce(new Error('expired'))
    await store.loadUsers()
    expect(store.users).toEqual([])
    await store.loadUsers()
    expect(store.users).toHaveLength(1)
  })
  it('ignores overlapping stale success/error and late responses after unload', async () => {
    const store = useAdministrationUsersStore()
    const adapter = instance.defaults.adapter as import('axios').AxiosAdapter
    const old = deferred<void>()
    const newer = deferred<void>()
    let call = 0
    instance.defaults.adapter = async (config) => {
      await (++call === 1 ? old.promise : newer.promise)
      return adapter(config)
    }
    const first = store.loadUsers()
    await flushPromises()
    const second = store.loadUsers()
    await flushPromises()
    old.resolve()
    await first
    expect(store.loading).toBe(true)
    newer.reject(new Error('offline'))
    await second
    expect(store.users).toEqual([])
    expect(store.loading).toBe(false)
    const stale = deferred<void>()
    instance.defaults.adapter = async (config) => {
      await stale.promise
      return adapter(config)
    }
    const third = store.loadUsers()
    await flushPromises()
    store.clear()
    stale.reject(new Error('stale'))
    await third
    expect(store.users).toEqual([])
    expect(store.loading).toBe(false)
    auth.isAuthenticated = false
    await store.loadUsers()
  })
  it('keeps server revisions and hydrated models in the table store', async () => {
    const store = useAdministrationUsersStore()
    await store.loadUsers({ page: 1, take: 10, sort: 'user.metadata.last_sign_in' })
    expect(store.users[0]).toBeInstanceOf(UserAdministrationDto)
    expect(store.users[0]?.version).toBe(9)
    expect(store.users[0]?.createdAt).toBeInstanceOf(Date)
    expect(store.pagination.take).toBe(10)
    expect(store.loading).toBe(false)
    expect(request.mock.calls[0]![0].params.sort).toBe('user.metadata.last_sign_in')
  })

  it('clears prior rows and avoids protected requests when access is lost', async () => {
    const store = useAdministrationUsersStore()
    await store.loadUsers()
    request.mockClear()
    auth.canActivate.mockReturnValue(false)
    await store.loadUsers()
    expect(store.users).toEqual([])
    expect(request).not.toHaveBeenCalled()
    expect(store.loading).toBe(false)
  })
})
