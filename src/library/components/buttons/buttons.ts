import { type Tone as LinkTone } from '../links/links'

export type Variant = 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'
export type Tone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
export type Size = 'sm' | 'md' | 'lg' | 'xl'
export type Radius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'

export type ButtonLinkProps = {
  tone?: LinkTone
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  underline?: 'always' | 'hover'
}
