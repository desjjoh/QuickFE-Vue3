import type { CountryDto } from '@/library/models/reference'
import * as Yup from 'yup'

export type proptype = {
  initialValues?: Partial<FormValues>
  callback?: (values: FormValues) => Promise<void>
  callbackSubmit: (values: FormValues) => Promise<void>
}

export type FormValues = {
  country: CountryDto
}

export const validationSchema = Yup.object().shape({
  country: Yup.mixed<CountryDto>().required('validation.required'),
})

export class CountryPayload {
  public readonly country_id: string

  constructor(payload: FormValues) {
    this.country_id = payload.country.id
  }
}
