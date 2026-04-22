import type { App } from 'vue'
import { vGrow } from './_grow'
import { vShrink } from './_shrink'

export function applyDirectives(app: App<Element>): void {
  app.directive('grow', vGrow)
  app.directive('shrink', vShrink)
}
