import type { PermissionKey, RoleKey } from '@/config/permissions'
import 'vue-router'
import type { RouteDataLoader } from './route-data'

declare module 'vue-router' {
  interface RouteMeta {
    dataLoader?: RouteDataLoader
    pageTitle?: string
    contentKey?: string
    requiresAuth?: boolean
    requiredRoles?: readonly RoleKey[]
    requiredPermissions?: readonly PermissionKey[]
    isGuestRoute?: boolean
    scrollToTop?: boolean
  }
}
