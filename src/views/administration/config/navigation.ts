import { LayoutDashboard, ListChecks, Users } from '@lucide/vue'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import {
  AuditPermissions,
  UserAdministrationPermissions,
  type PermissionKey,
} from '@/config/permissions'

export type AdministrationNavigationItem = {
  icon: Component
  label: string
  to: RouteLocationRaw
  permissions?: readonly PermissionKey[]
}

export type AdministrationNavigationSection = {
  items: AdministrationNavigationItem[]
  label: string
}

export const administrationNavigation: AdministrationNavigationSection[] = [
  {
    label: 'app.routes.administration',
    items: [
      {
        icon: LayoutDashboard,
        label: 'administration.navigation.items.overview',
        to: { name: 'administration-dashboard' },
      },
      {
        icon: Users,
        label: 'administration.navigation.items.users',
        to: { name: 'administration-identity' },
        permissions: [UserAdministrationPermissions.READ_USERS],
      },
      {
        icon: ListChecks,
        label: 'administration.navigation.items.auditLog',
        to: { name: 'administration-activity' },
        permissions: [AuditPermissions.SEARCH_AUDIT],
      },
    ],
  },
]
