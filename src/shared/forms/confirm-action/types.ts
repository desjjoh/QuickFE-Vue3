import type { Tone } from '@/shared/components/buttons/types'

export type proptype = {
  title?: string

  submit?: string
  cancel?: string

  tone?: Tone

  callbackSubmit: () => Promise<void>
  callbackCancel?: () => void
}
