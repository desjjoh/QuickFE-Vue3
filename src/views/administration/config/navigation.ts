import { LayoutDashboard, Settings, ShieldCheck, Users } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type AdministrationNavigationItem = {
  icon: Component
  label: string
  to: RouteLocationRaw
}

export const administrationNavigation: AdministrationNavigationItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    to: { name: 'administration', hash: '#overview' },
  },
  {
    icon: Users,
    label: 'Users',
    to: { name: 'administration', hash: '#users' },
  },
  {
    icon: ShieldCheck,
    label: 'Permissions',
    to: { name: 'administration', hash: '#permissions' },
  },
  {
    icon: Settings,
    label: 'Settings',
    to: { name: 'administration', hash: '#settings' },
  },
]
