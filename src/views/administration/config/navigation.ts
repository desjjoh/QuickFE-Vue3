import { LayoutDashboard, Settings, ShieldCheck, Users } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type AdministrationNavigationItem = {
  icon: Component
  label: string
  to: RouteLocationRaw
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
      },
      {
        icon: ShieldCheck,
        label: 'Permissions',
        to: { name: 'settings' },
      },
    ],
  },
  {
    label: 'Configuration',
    items: [
      {
        icon: Settings,
        label: 'Settings',
        to: { name: 'settings' },
      },
    ],
  },
]
