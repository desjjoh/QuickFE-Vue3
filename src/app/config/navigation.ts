import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from 'vue-router'

export type iRoute = {
  to: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
  label: string
}

export const mainNavigation: iRoute[] = [
  {
    label: 'app.routes.playground',
    to: { name: 'playground' },
  },
  {
    label: 'app.routes.administration',
    to: { name: 'administration' },
  },
]

export const moreNavigation: iRoute[] = [
  {
    label: 'app.routes.about',
    to: { name: 'settings' },
  },
  {
    label: 'app.routes.blog',
    to: { name: 'settings' },
  },
  {
    label: 'app.routes.developers',
    to: { name: 'settings' },
  },
  {
    label: 'app.routes.jobs',
    to: { name: 'settings' },
  },
  {
    label: 'app.routes.partners',
    to: { name: 'settings' },
  },
  {
    label: 'app.routes.privacy',
    to: { name: 'settings' },
  },
  {
    label: 'app.routes.terms',
    to: { name: 'settings' },
  },
]

export const userNavigation: iRoute[] = [
  {
    label: 'app.routes.profile',
    to: { name: 'profile' },
  },
  {
    label: 'app.routes.settings',
    to: { name: 'settings' },
  },
]
