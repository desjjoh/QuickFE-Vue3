import { isNavigationFailure, NavigationFailureType, type Router } from 'vue-router'
import { useRouteDataStore } from '@/shared/stores/route-data'

/** Initial loads and dataset disposal belong to navigation, not page component lifetimes. */
export function installRouteDataLifecycle(router: Router): void {
  router.beforeResolve(async (to, from) => {
    // Mounted table hooks own query-only reloads. Parent owners survive child navigation.
    if (to.path === from.path && to.matched.length === from.matched.length) return
    const retained = from.matched
      .filter(
        (record) =>
          to.matched.includes(record) &&
          (record.meta.dataLoader?.public ||
            JSON.stringify(to.params) === JSON.stringify(from.params)),
      )
      .flatMap((record) => (record.meta.dataLoader ? [record.meta.dataLoader] : []))

    await useRouteDataStore().prepare(to, true, retained)
  })
  router.afterEach((to, _from, failure) => {
    const data = useRouteDataStore()

    if (!failure) data.completeNavigation(to)
    else if (!isNavigationFailure(failure, NavigationFailureType.duplicated)) {
      data.discardNavigation(to)
    }
  })
  router.onError((_error, to) => useRouteDataStore().discardNavigation(to))
}
