import type { InjectionKey, Ref } from 'vue'

export const APP_SHELL_SCROLL_REF_KEY: InjectionKey<Ref<HTMLElement | null>> = Symbol(
  'APP_SHELL_SCROLL_REF_KEY',
)

export function getAppShellScrollContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-app-shell-scroll]')
}

export function getReducedMotionBehavior(): ScrollBehavior | undefined {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}
