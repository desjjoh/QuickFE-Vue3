import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from 'vue-router'

export type iRoute = {
  to: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
  label: string
}

export const mainNavigation: iRoute[] = [
  {
    label: 'app.routes.dashboard',
    to: { name: 'dashboard' },
  },
  {
    label: 'app.routes.playground',
    to: { name: 'playground' },
  },
]

export const moreNavigation: iRoute[] = [
  {
    label: 'app.routes.about',
    to: { name: 'root' },
  },
  {
    label: 'app.routes.blog',
    to: { name: 'root' },
  },
  {
    label: 'app.routes.developers',
    to: { name: 'root' },
  },
  {
    label: 'app.routes.jobs',
    to: { name: 'root' },
  },
  {
    label: 'app.routes.partners',
    to: { name: 'root' },
  },
  {
    label: 'app.routes.privacy',
    to: { name: 'root' },
  },
  {
    label: 'app.routes.terms',
    to: { name: 'root' },
  },
]
