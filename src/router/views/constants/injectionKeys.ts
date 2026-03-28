import type { InjectionKey, Ref } from 'vue'

export const APP_SHELL_SCROLL_REF_KEY: InjectionKey<Ref<HTMLElement | null>> = Symbol(
  'APP_SHELL_SCROLL_REF_KEY',
)
