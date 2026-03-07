export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'mega'
export type Tone = 'primary' | 'neutral'
export type Variants = 'solid' | 'soft'
export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full'

export type Props = {
  src?: string
  alt?: string
  fallback?: string

  size?: Size
  tone?: Tone
  radius?: Radius
  variant?: Variants
}
