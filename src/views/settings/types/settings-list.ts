import type { Component } from 'vue'

export type SettingsActionVariant = 'surface' | 'soft' | 'ghost'
export type SettingsActionTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export type SettingsListAction = {
  key: string
  label: string
  ariaLabel?: string
  variant?: SettingsActionVariant
  tone?: SettingsActionTone
  icon?: Component
  iconOnly?: boolean
  disabled?: boolean
  onClick?: () => void | Promise<void>
}

export type SettingsListItemConfig = {
  key: string
  title: string
  description?: string
  icon: Component
  iconSize?: number
  actions?: SettingsListAction[]
}
