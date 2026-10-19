import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { evaluateRouteAccess } from '@/shared/helpers/route-access'

export type DataRoute = Pick<RouteLocationNormalized, 'fullPath' | 'query' | 'meta'> &
  Partial<Pick<RouteLocationNormalized, 'matched'>>

export interface RouteDataLoader {
  /** Public reference data survives account changes, but is still owned by its route. */
  public?: boolean
  load: (route: DataRoute) => Promise<void>
  clear: () => void
  error: () => string | null
}

export function routeDataLoaders(route: DataRoute): RouteDataLoader[] {
  const loaders = route.matched
    ? route.matched.map((record) => record.meta.dataLoader)
    : [route.meta.dataLoader]
  return [...new Set(loaders.filter((loader): loader is RouteDataLoader => !!loader))]
}

export function routeAccess(route: DataRoute) {
  const auth = useAuthStore()
  return evaluateRouteAccess(
    route.meta,
    auth.isAuthenticated,
    auth.hasRequiredRole(route.meta.requiredRoles ?? []),
    auth.canActivate(route.meta.requiredPermissions ?? []),
  )
}
