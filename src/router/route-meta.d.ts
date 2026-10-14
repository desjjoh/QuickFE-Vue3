import type { PermissionKey, RoleKey } from '@/config/permissions'
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    pageTitle?: string
    contentKey?: string
    requiresAuth?: boolean
    requiredRoles?: readonly RoleKey[]
    requiredPermissions?: readonly PermissionKey[]
    isGuestRoute?: boolean
    scrollToTop?: boolean
  }
}
