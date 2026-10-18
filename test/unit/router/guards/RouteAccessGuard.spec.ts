import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive, defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import RouteAccessGuard from '@/router/guards/RouteAccessGuard.vue'
import { useRouteDataStore, prepareRouteData } from '@/shared/stores/route-data'
import { UserAdministrationPermissions } from '@/config/permissions'

const auth = reactive({
  isAuthenticated: false,
  user: null as { id: string } | null,
  permitted: true,
  hasRequiredRole: () => true,
  canActivate: () => auth.permitted,
})
const load = vi.fn()
const clear = vi.fn()
const error = vi.fn<() => string | null>()
const route = reactive({
  path: '/profile/account',
  fullPath: '/profile/account',
  query: {},
  meta: {
    requiresAuth: true,
    requiredPermissions: [UserAdministrationPermissions.READ_USERS],
    dataLoader: { load, clear, error },
  },
})
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => auth }))
vi.mock('vue-router', () => ({ useRoute: () => route }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
let wrapper: VueWrapper | undefined

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function render() {
  wrapper = mount(RouteAccessGuard, {
    slots: {
      default: defineComponent({ template: '<div data-test="protected">Prepared content</div>' }),
    },
    global: {
      stubs: {
        UnauthorizedView: {
          props: ['title'],
          template: '<div data-test="blocked">{{ title }}</div>',
        },
        ErrorSplashView: {
          props: ['error', 'reset'],
          template: '<button data-test="retry" @click="reset">{{ error.message }}</button>',
        },
      },
    },
  })
  return wrapper
}
beforeEach(() => {
  setActivePinia(createPinia())
  auth.isAuthenticated = false
  auth.user = null
  auth.permitted = true
  route.path = '/profile/account'
  route.fullPath = '/profile/account'
  load.mockReset().mockResolvedValue(undefined)
  clear.mockReset()
  error.mockReset().mockReturnValue(null)
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('guarded route preparation', () => {
  it('keeps the guest view until post-sign-in loading completes without mounting the page early', async () => {
    const wait = deferred()
    load.mockReturnValue(wait.promise)
    const view = render()
    expect(load).not.toHaveBeenCalled()
    auth.user = { id: 'one' }
    auth.isAuthenticated = true
    await flushPromises()
    expect(load).toHaveBeenCalledOnce()
    expect(view.find('[data-test=blocked]').exists()).toBe(true)
    expect(view.find('[data-test=protected]').exists()).toBe(false)
    wait.resolve()
    await flushPromises()
    expect(view.find('[data-test=protected]').exists()).toBe(true)
  })

  it('reuses navigation preparation and leaves query-only fetching to table hooks', async () => {
    auth.user = { id: 'one' }
    auth.isAuthenticated = true
    await prepareRouteData(route)
    const view = render()
    await flushPromises()
    expect(view.find('[data-test=protected]').exists()).toBe(true)
    route.fullPath += '?page=2'
    await flushPromises()
    expect(load).toHaveBeenCalledOnce()
    expect(view.find('[data-test=protected]').exists()).toBe(true)
  })

  it('holds failed loads behind an error and retries before exposing content', async () => {
    auth.user = { id: 'one' }
    auth.isAuthenticated = true
    load.mockRejectedValueOnce(new Error('offline'))
    await prepareRouteData(route)
    const view = render()
    await flushPromises()
    expect(view.find('[data-test=protected]').exists()).toBe(false)
    expect(view.get('[data-test=retry]').text()).toBe('offline')
    const wait = deferred()
    load.mockReturnValue(wait.promise)
    await view.get('[data-test=retry]').trigger('click')
    expect(view.find('[data-test=protected]').exists()).toBe(false)
    wait.resolve()
    await flushPromises()
    expect(view.find('[data-test=protected]').exists()).toBe(true)
  })

  it.each(['logout', 'permission', 'account', 'navigation'])(
    'prevents a stale load from opening the page after %s',
    async (change) => {
      const wait = deferred()
      load.mockReturnValueOnce(wait.promise)
      const view = render()
      auth.user = { id: 'one' }
      auth.isAuthenticated = true
      await flushPromises()
      if (change === 'logout') auth.isAuthenticated = false
      else if (change === 'permission') auth.permitted = false
      else if (change === 'account') {
        auth.user = { id: 'two' }
        load.mockReturnValue(new Promise(() => {}))
      } else {
        load.mockReturnValue(new Promise(() => {}))
        route.path = '/other'
        route.fullPath = '/other'
      }
      wait.resolve()
      await flushPromises()
      expect(view.find('[data-test=protected]').exists()).toBe(false)
      expect(useRouteDataStore().isPrepared(route)).toBe(false)
    },
  )

  it('loads again when permission is granted without navigation', async () => {
    auth.user = { id: 'one' }
    auth.isAuthenticated = true
    auth.permitted = false
    const view = render()
    expect(view.get('[data-test=blocked]').text()).toContain('forbidden')
    auth.permitted = true
    await flushPromises()
    expect(load).toHaveBeenCalledOnce()
    expect(view.find('[data-test=protected]').exists()).toBe(true)
  })
})
