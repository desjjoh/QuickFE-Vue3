import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { reactive } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { installRouteDataLifecycle } from '@/router/data-lifecycle'
import { useRouteDataStore } from '@/shared/stores/route-data'
import type { RouteDataLoader } from '@/router/route-data'
import { deferred } from '@test/support/async'

const auth = reactive({
  isAuthenticated: true,
  user: { id: 'one' } as { id: string } | null,
  hasRequiredRole: vi.fn(() => true),
  canActivate: vi.fn(() => true),
})
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => auth }))

function dataset(isPublic = false) {
  let value: string | null = null
  let generation = ''
  const loader: RouteDataLoader = {
    public: isPublic,
    load: vi.fn(async () => {
      value = 'loaded'
    }),
    clear: vi.fn(() => {
      generation = crypto.randomUUID()
      value = null
    }),
    error: vi.fn(() => null),
  }
  return {
    loader,
    value: () => value,
    delay: (wait: Promise<void>) => {
      vi.mocked(loader.load).mockImplementationOnce(async () => {
        const request = generation
        await wait
        if (request === generation) value = 'late'
      })
    },
  }
}
let router: Router
const routers: Router[] = []
function setup() {
  const reference = dataset(true)
  const first = dataset()
  const second = dataset()
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: { template: '<router-view />' },
        meta: { dataLoader: reference.loader },
        children: [
          { path: 'first', component: {}, meta: { requiresAuth: true, dataLoader: first.loader } },
          {
            path: 'second',
            component: {},
            meta: { requiresAuth: true, dataLoader: second.loader },
          },
          { path: 'empty', component: {} },
        ],
      },
      { path: '/outside', component: {} },
    ],
  })
  routers.push(router)
  installRouteDataLifecycle(router)
  return { reference, first, second, data: useRouteDataStore() }
}

beforeEach(() => {
  setActivePinia(createPinia())
  auth.isAuthenticated = true
  auth.user = { id: 'one' }
})
afterEach(() => {
  for (const instance of routers.splice(0)) instance.options.history.destroy()
})

describe('router-owned data lifecycle', () => {
  it('loads before entry and clears on exit without needing mounted components', async () => {
    const { reference, first, second } = setup()
    const wait = deferred<void>()
    first.delay(wait.promise)
    const entering = router.push('/first')
    await vi.waitFor(() => expect(first.loader.load).toHaveBeenCalledOnce())
    expect(router.currentRoute.value.path).toBe('/')
    wait.resolve()
    await entering
    expect(first.value()).toBe('late')
    await router.push('/second')
    expect(first.value()).toBeNull()
    expect(first.loader.clear).toHaveBeenCalledOnce()
    expect(second.value()).toBe('loaded')
    expect(second.loader.clear).not.toHaveBeenCalled()
    expect(reference.loader.load).toHaveBeenCalledOnce()
    expect(reference.loader.clear).not.toHaveBeenCalled()
    await router.push('/first')
    expect(first.loader.load).toHaveBeenCalledTimes(2)
    expect(second.value()).toBeNull()
    await router.push('/outside')
    expect(first.value()).toBeNull()
    expect(reference.value()).toBeNull()
  })

  it('leaves query/hash changes and duplicate navigation to the mounted page', async () => {
    const { first } = setup()
    await router.push('/first')
    await router.push('/first?page=2')
    await router.push('/first?page=2#details')
    await router.push('/first?page=2#details')
    expect(first.loader.load).toHaveBeenCalledOnce()
    expect(first.loader.clear).not.toHaveBeenCalled()
    expect(first.value()).toBe('loaded')
  })

  it('retains current data and discards prepared data when a later guard aborts', async () => {
    const { first, second } = setup()
    await router.push('/first')
    router.beforeResolve((to) => (to.path === '/second' ? false : undefined))
    await router.push('/second')
    expect(router.currentRoute.value.path).toBe('/first')
    expect(first.value()).toBe('loaded')
    expect(first.loader.clear).not.toHaveBeenCalled()
    expect(second.loader.load).toHaveBeenCalledOnce()
    expect(second.value()).toBeNull()
    await router.push('/first?page=2')
    expect(first.loader.clear).not.toHaveBeenCalled()
  })

  it('retains source data when navigation throws, and permits recovery', async () => {
    const { first, second } = setup()
    await router.push('/first')
    const remove = router.beforeResolve(() => {
      throw new Error('navigation rejected')
    })
    await expect(router.push('/second')).rejects.toThrow('navigation rejected')
    expect(first.value()).toBe('loaded')
    expect(second.value()).toBeNull()
    remove()
    await router.push('/second')
    expect(second.loader.load).toHaveBeenCalledTimes(2)
    expect(first.value()).toBeNull()
  })

  it('invalidates canceled candidate requests while preserving the current route', async () => {
    const { first, second } = setup()
    await router.push('/first')
    const wait = deferred<void>()
    second.delay(wait.promise)
    const canceled = router.push('/second')
    await vi.waitFor(() => expect(second.loader.load).toHaveBeenCalledOnce())
    await router.push('/first?page=2')
    expect(first.value()).toBe('loaded')
    expect(second.loader.clear).toHaveBeenCalledOnce()
    wait.resolve()
    await canceled
    expect(second.value()).toBeNull()
    expect(first.loader.clear).not.toHaveBeenCalled()
  })

  it('does not let cancellation of an older route clear a newer candidate using its loader', async () => {
    const { first, second } = setup()
    await router.push('/first')
    const wait = deferred<void>()
    second.delay(wait.promise)
    const old = router.push('/second?old=1')
    await vi.waitFor(() => expect(second.loader.load).toHaveBeenCalledOnce())
    await router.push('/second?new=1')
    expect(second.value()).toBe('loaded')
    const clears = vi.mocked(second.loader.clear).mock.calls.length
    wait.resolve()
    await old
    expect(second.value()).toBe('loaded')
    expect(second.loader.clear).toHaveBeenCalledTimes(clears)
    expect(first.value()).toBeNull()
  })

  it('retains a newer prepared candidate while its final navigation guard is pending', async () => {
    const { second } = setup()
    await router.push('/first')
    const oldResponse = deferred<void>()
    const finalGuard = deferred<void>()
    second.delay(oldResponse.promise)
    router.beforeResolve(async (to) => {
      if (to.query.new) await finalGuard.promise
    })
    const old = router.push('/second?old=1')
    await vi.waitFor(() => expect(second.loader.load).toHaveBeenCalledOnce())
    const newer = router.push('/second?new=1')
    await vi.waitFor(() => expect(second.value()).toBe('loaded'))
    oldResponse.resolve()
    await old
    expect(second.value()).toBe('loaded')
    finalGuard.resolve()
    await newer
    expect(second.value()).toBe('loaded')
  })

  it('keeps public reference data through account changes and reloads private data before recovery', async () => {
    const { reference, first, data } = setup()
    await router.push('/first')
    auth.isAuthenticated = false
    auth.user = null
    expect(first.value()).toBeNull()
    expect(reference.value()).toBe('loaded')
    auth.user = { id: 'two' }
    auth.isAuthenticated = true
    await data.prepare(router.currentRoute.value)
    expect(first.value()).toBe('loaded')
    expect(first.loader.load).toHaveBeenCalledTimes(2)
    await router.push('/empty')
    expect(first.value()).toBeNull()
  })

  it('retains private parent datasets between child pages and clears them on section exit', async () => {
    setup()
    const parent = dataset()
    router.addRoute({
      path: '/section',
      component: {},
      meta: { requiresAuth: true, dataLoader: parent.loader },
      children: [
        { path: 'one', component: {} },
        { path: 'two', component: {} },
      ],
    })
    await router.push('/section/one')
    await router.push('/section/two')
    expect(parent.loader.load).toHaveBeenCalledOnce()
    expect(parent.loader.clear).not.toHaveBeenCalled()
    await router.push('/outside')
    expect(parent.value()).toBeNull()
    expect(parent.loader.clear).toHaveBeenCalledOnce()
  })

  it('retries a failed parent loader on the next child entry instead of retaining failed data', async () => {
    const { reference, first, second, data } = setup()
    vi.mocked(reference.loader.load).mockRejectedValueOnce(new Error('references offline'))
    await router.push('/first')
    expect(first.loader.load).not.toHaveBeenCalled()
    expect(data.error?.message).toBe('references offline')
    await router.push('/second')
    expect(reference.loader.load).toHaveBeenCalledTimes(2)
    expect(second.value()).toBe('loaded')
    expect(data.isPrepared(router.currentRoute.value)).toBe(true)
  })

  it('reloads an entered record when its path parameters change', async () => {
    const { first } = setup()
    router.addRoute({ path: '/item/:id', component: {}, meta: { dataLoader: first.loader } })
    await router.push('/item/one')
    await router.push('/item/two')
    expect(first.loader.load).toHaveBeenCalledTimes(2)
    expect(first.value()).toBe('loaded')
    expect(first.loader.clear).not.toHaveBeenCalled()
  })

  it('loads public parent data for guests without invoking protected child loaders', async () => {
    const { reference, first, data } = setup()
    auth.isAuthenticated = false
    auth.user = null
    await router.push('/first')
    expect(reference.value()).toBe('loaded')
    expect(first.loader.load).not.toHaveBeenCalled()
    expect(data.isPrepared(router.currentRoute.value)).toBe(false)
  })
})
