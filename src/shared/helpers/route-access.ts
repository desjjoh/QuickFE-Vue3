import type { RouteMeta } from 'vue-router'

export type RouteAccess = 'allowed' | 'unauthorized' | 'forbidden'

export function evaluateRouteAccess(
  meta: Pick<RouteMeta, 'requiresAuth' | 'requiredRoles'>,
  isAuthenticated: boolean,
  hasRequiredRole: boolean,
): RouteAccess {
  if (meta.requiresAuth && !isAuthenticated) return 'unauthorized'

  if (meta.requiredRoles?.length && isAuthenticated && !hasRequiredRole) return 'forbidden'

  return 'allowed'
}
