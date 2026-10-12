import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { instance } from '@/shared/api/useLocalhostAPI'
import { userFixture } from '@/shared/api/__tests__/fixtures'
import { UserAdministrationDto } from '@/library/models/administration'
import { useAdministrationUsersStore } from './users'

const auth = vi.hoisted(() => ({
  isAuthenticated: true,
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
