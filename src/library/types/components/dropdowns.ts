import type { InjectionKey } from 'vue'

export type DropdownMenuContext = {
  focusTrigger: () => void
  focusMenu: () => void
  requestItemFocus: (item: HTMLElement) => void
  close: (options?: { restoreFocus?: boolean }) => void
}

export const DropdownMenuContextKey: InjectionKey<DropdownMenuContext> =
  Symbol('DropdownMenuContext')

// TYPES
export type Side = 'top' | 'bottom'
export type Align = 'start' | 'center' | 'end'

export type Props = {
  closeOnSelect?: boolean
  disabled?: boolean

  modal?: boolean

  side?: Side
  sideOffset?: number

  contentAlign?: Align
  alignOffset?: number

  matchTriggerWidth?: boolean

  collisionPadding?: number
  avoidCollisions?: boolean

  keepMounted?: boolean
}

export type position = {
  top: number
  left: number
  minWidth: number
}

export type TriggerAttrs = {
  'aria-haspopup': 'menu'
  'aria-expanded': 'true' | 'false'
  'aria-controls': string
}

export type Tone = 'success' | 'warning' | 'danger' | 'info'
