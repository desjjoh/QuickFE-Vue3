import type { TimezoneDto } from '@/library/models/reference'
import * as Yup from 'yup'

export type proptype = {
  initialValues?: Partial<FormValues>
  callback?: (values: FormValues) => Promise<void>
  callbackSubmit: (values: FormValues) => Promise<void>
}

export type FormValues = {
  timezone: TimezoneDto
}

export const validationSchema = Yup.object().shape({
  timezone: Yup.mixed<TimezoneDto>().required('validation.required'),
})

export class TimezonePayload {
  public readonly token_id: string

  constructor(payload: FormValues) {
    this.token_id = payload.timezone.id
  }
}
