import type { InjectionKey } from 'vue'

export type DropdownMenuContext = {
  focusTrigger: () => void
  focusMenu: () => void
  close: (options?: { restoreFocus?: boolean }) => void
}

export const DropdownMenuContextKey: InjectionKey<DropdownMenuContext> =
  Symbol('DropdownMenuContext')
