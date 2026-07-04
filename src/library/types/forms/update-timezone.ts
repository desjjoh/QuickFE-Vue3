import type { TimezoneDto } from '@/library/models/reference'
import * as Yup from 'yup'

export type proptype = {
  callback?: (values: FormValues) => Promise<void>
  callbackSubmit: (values: FormValues) => Promise<void>
}

export type FormValues = {
  timezone: TimezoneDto
}

export const validationSchema = Yup.object().shape({
  timezone: Yup.mixed<TimezoneDto>().required('validation.required'),
})
