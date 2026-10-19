import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import {
  routeAccess,
  routeDataLoaders,
  type DataRoute,
  type RouteDataLoader,
} from '@/router/route-data'
import { useAuthStore } from './auth'

export const useRouteDataStore = defineStore('route-data', () => {
  const auth = useAuthStore()
  const preparedKey = ref<string | null>(null)
  const errorKey = ref<string | null>(null)
  const error = shallowRef<Error>()
  let pending: { key: string; promise: Promise<boolean>; loaders: RouteDataLoader[] } | undefined
  let candidate: { key: string; loaders: RouteDataLoader[] } | undefined
  const owners = new Set<RouteDataLoader>()
  const loaded = new Set<RouteDataLoader>()
  let active = new Set<RouteDataLoader>()
  let requestId = crypto.randomUUID()

  const keyFor = (route: DataRoute) =>
    JSON.stringify([auth.$sessionKey, auth.user?.id, route.fullPath])
  const isPrepared = (route: DataRoute) => preparedKey.value === keyFor(route)

  function clear(loader: RouteDataLoader): void {
    loader.clear()
    owners.delete(loader)
    loaded.delete(loader)
  }

  function invalidate(): void {
    requestId = crypto.randomUUID()
    pending = undefined
    candidate = undefined
    preparedKey.value = null
    errorKey.value = null
    error.value = undefined
    for (const loader of owners) if (!loader.public) clear(loader)
  }

  function cancelPending(destination?: DataRoute): void {
    if (!pending || (destination && pending.key === keyFor(destination))) return
    requestId = crypto.randomUUID()
    for (const loader of pending.loaders) if (!active.has(loader)) clear(loader)
    pending = undefined
    candidate = undefined
    preparedKey.value = null
    errorKey.value = null
    error.value = undefined
  }

  /** Release exited owners only after navigation succeeds, independently of component unmount. */
  function completeNavigation(route: DataRoute): void {
    cancelPending(route)
    active = new Set(routeDataLoaders(route))
    for (const loader of owners) if (!active.has(loader)) clear(loader)
    candidate = undefined
  }

  /** Discard a failed candidate without touching the current page or a newer candidate. */
  function discardNavigation(route: DataRoute): void {
    if (pending?.key === keyFor(route)) cancelPending()
    const retained = new Set([
      ...active,
      ...(candidate && candidate.key !== keyFor(route) ? candidate.loaders : []),
    ])
    for (const loader of routeDataLoaders(route)) {
      if (owners.has(loader) && !retained.has(loader)) clear(loader)
    }
    if (candidate?.key === keyFor(route)) candidate = undefined
    if (preparedKey.value === keyFor(route)) preparedKey.value = null
  }

  function prepare(
    route: DataRoute,
    force = false,
    retained: RouteDataLoader[] = [],
  ): Promise<boolean> {
    route = { ...route, query: { ...route.query }, meta: { ...route.meta } }
    const allowed = routeAccess(route) === 'allowed'
    const loaders = routeDataLoaders(route).filter((loader) => allowed || loader.public)
    if (!allowed && !loaders.length) return Promise.resolve(false)
    const key = keyFor(route)
    if (pending?.key === key) return pending.promise
    if (!force && isPrepared(route)) return Promise.resolve(true)
    cancelPending()
    const currentRequest = crypto.randomUUID()
    requestId = currentRequest
    preparedKey.value = null
    error.value = undefined
    errorKey.value = null
    const entering = loaders.filter((loader) => !retained.includes(loader) || !loaded.has(loader))
    candidate = { key, loaders: entering }
    for (const loader of entering) owners.add(loader)
    const current = () => requestId === currentRequest && keyFor(route) === key

    // Register the shared promise before any loader can run.
    const promise = Promise.resolve().then(async () => {
      try {
        for (const loader of entering) {
          if (!current() || (!loader.public && routeAccess(route) !== 'allowed')) return false
          loaded.delete(loader)
          await loader.load(route)
          if (!current()) return false
          const message = loader.error()
          if (message) throw new Error(message)
          loaded.add(loader)
        }
        if (!current() || routeAccess(route) !== 'allowed') return false
        preparedKey.value = key
        return true
      } catch (cause) {
        if (current()) {
          error.value = cause instanceof Error ? cause : new Error(String(cause))
          errorKey.value = key
        }
        return false
      } finally {
        if (requestId === currentRequest) pending = undefined
      }
    })
    pending = { key, promise, loaders: entering }
    return promise
  }

  watch([() => auth.$sessionKey, () => auth.isAuthenticated, () => auth.user?.id], invalidate, {
    flush: 'sync',
  })

  return {
    error,
    errorKey,
    keyFor,
    isPrepared,
    prepare,
    invalidate,
    cancelPending,
    completeNavigation,
    discardNavigation,
  }
})

export async function prepareRouteData(route: DataRoute): Promise<void> {
  await useRouteDataStore().prepare(route, true)
}
