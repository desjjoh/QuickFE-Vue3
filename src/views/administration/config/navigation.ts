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
    label: 'administration.navigation.sections.general',
    items: [
      {
        icon: LayoutDashboard,
        label: 'administration.navigation.items.overview',
        to: { name: 'administration-overview' },
      },
    ],
  },
  {
    label: 'administration.navigation.sections.accessManagement',
    items: [
      {
        icon: Users,
        label: 'administration.navigation.items.users',
        to: { name: 'administration-user-management' },
        permissions: [UserAdministrationPermissions.READ_USERS],
      },
    ],
  },
]
