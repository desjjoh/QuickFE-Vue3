import { LayoutDashboard, Users } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { UserAdministrationPermissions, type PermissionKey } from '@/config/permissions'

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
    label: 'General',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Overview',
        to: { name: 'administration-overview' },
      },
    ],
  },
  {
    label: 'Access management',
    items: [
      {
        icon: Users,
        label: 'Users',
        to: { name: 'administration-user-management' },
        permissions: [UserAdministrationPermissions.READ_USERS],
      },
    ],
  },
]
