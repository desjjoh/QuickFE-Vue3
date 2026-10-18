import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { routeAccess, type DataRoute, type RouteDataLoader } from '@/router/route-data'
import { useAuthStore } from './auth'

export const useRouteDataStore = defineStore('route-data', () => {
  const auth = useAuthStore()
  const preparedKey = ref<string | null>(null)
  const errorKey = ref<string | null>(null)
  const error = shallowRef<Error>()
  let pending: { key: string; promise: Promise<boolean> } | undefined
  let owner: RouteDataLoader | undefined
  let requestId = crypto.randomUUID()

  const keyFor = (route: DataRoute) => JSON.stringify([auth.user?.id, route.fullPath])
  const isPrepared = (route: DataRoute) => preparedKey.value === keyFor(route)

  function invalidate(): void {
    requestId = crypto.randomUUID()
    pending = undefined
    preparedKey.value = null
    errorKey.value = null
    error.value = undefined
    owner?.clear()
    owner = undefined
  }

  function cancelPending(destination?: DataRoute): void {
    if (pending && (!destination || pending.key !== keyFor(destination))) invalidate()
  }

  function prepare(route: DataRoute, force = false): Promise<boolean> {
    route = { fullPath: route.fullPath, query: { ...route.query }, meta: { ...route.meta } }
    if (routeAccess(route) !== 'allowed') return Promise.resolve(false)
    const key = keyFor(route)
    if (pending?.key === key) return pending.promise
    if (!force && isPrepared(route)) return Promise.resolve(true)
    cancelPending()
    const currentRequest = crypto.randomUUID()
    requestId = currentRequest
    owner = route.meta.dataLoader
    preparedKey.value = null
    error.value = undefined
    errorKey.value = null
    const loader = owner
    const current = () =>
      requestId === currentRequest && keyFor(route) === key && routeAccess(route) === 'allowed'

    // Defer execution until the shared in-flight promise has been registered.
    const promise = Promise.resolve().then(async () => {
      try {
        if (!current()) return false
        await loader?.load(route)
        if (!current()) return false
        const message = loader?.error()
        if (message) throw new Error(message)
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
    pending = { key, promise }
    return promise
  }

  watch([() => auth.isAuthenticated, () => auth.user?.id], invalidate, { flush: 'sync' })

  return { error, errorKey, keyFor, isPrepared, prepare, invalidate, cancelPending }
})

export async function prepareRouteData(route: DataRoute): Promise<void> {
  await useRouteDataStore().prepare(route, true)
}
