import type { RouteMeta } from 'vue-router'

export type RouteAccess = 'allowed' | 'unauthorized' | 'forbidden'

export function evaluateRouteAccess(
  meta: Pick<RouteMeta, 'requiresAuth' | 'requiredRoles' | 'requiredPermissions'>,
  isAuthenticated: boolean,
  hasRequiredRole: boolean,
  hasRequiredPermission: boolean,
): RouteAccess {
  if (meta.requiresAuth && !isAuthenticated) return 'unauthorized'

  if (meta.requiredRoles?.length && isAuthenticated && !hasRequiredRole) return 'forbidden'

  if (meta.requiredPermissions?.length && isAuthenticated && !hasRequiredPermission) {
    return 'forbidden'
  }

  return 'allowed'
}
