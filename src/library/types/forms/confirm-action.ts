import type { Tone } from '@/library/types/components/buttons'

export type proptype = {
  title?: string

  submit?: string
  cancel?: string

  tone?: Tone

  callbackSubmit: () => Promise<void>
  callbackCancel?: () => void
}
