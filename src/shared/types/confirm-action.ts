import type { Tone } from '@/library/components/buttons/buttons'

export type proptype = {
  title?: string

  submit?: string
  cancel?: string

  tone?: Tone

  callbackSubmit: () => Promise<void>
  callbackCancel?: () => void
}
