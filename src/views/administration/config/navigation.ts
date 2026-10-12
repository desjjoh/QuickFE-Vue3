import { LayoutDashboard, Users, Newspaper } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import {
  UserAdministrationPermissions,
  ArticleAdministrationPermissions,
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
    label: 'administration.navigation.sections.domains',
    items: [
      {
        icon: Users,
        label: 'administration.navigation.items.identity',
        to: { name: 'administration-identity' },
        permissions: [UserAdministrationPermissions.READ_USERS],
      },
      {
        icon: Newspaper,
        label: 'administration.navigation.items.articles',
        to: { name: 'administration-articles' },
        permissions: [ArticleAdministrationPermissions.READ_ARTICLES],
      },
    ],
  },
]
