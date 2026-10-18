import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { evaluateRouteAccess } from '@/shared/helpers/route-access'

export type DataRoute = Pick<RouteLocationNormalized, 'fullPath' | 'query' | 'meta'>

export interface RouteDataLoader {
  load: (route: DataRoute) => Promise<void>
  clear: () => void
  error: () => string | null
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
