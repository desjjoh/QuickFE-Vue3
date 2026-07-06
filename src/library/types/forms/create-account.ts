import { isValidIsoDate } from '@/helpers/date'
import type { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference'
import * as Yup from 'yup'

export type proptype = {
  callback?: (values: FormValues) => Promise<void>
  callbackSubmit: (values: FormValues) => Promise<void>
}

export type FormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  gender: GenderDto
  dob: string
  country: CountryDto
  timezone: TimezoneDto
}

export class RegisterDto {
  public readonly first_name: string
  public readonly last_name: string
  public readonly email: string
  public readonly password: string
  public readonly gender_id: string
  public readonly dob: string
  public readonly country_id: string
  public readonly timezone_id: string

  constructor(payload: FormValues) {
    this.first_name = payload.firstName
    this.last_name = payload.lastName
    this.email = payload.email
    this.password = payload.password
    this.gender_id = payload.gender.id
    this.dob = payload.dob
    this.country_id = payload.country.id
    this.timezone_id = payload.timezone.id
  }
}

export const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('validation.required'),
  lastName: Yup.string().required('validation.required'),
  gender: Yup.mixed<GenderDto>().required('validation.required'),
  dob: Yup.string()
    .required('validation.required')
    .test('valid-date', 'validation.date', isValidIsoDate),
  country: Yup.mixed<CountryDto>().required('validation.required'),
  timezone: Yup.mixed<TimezoneDto>().required('validation.required'),
  email: Yup.string().email('validation.email').required('validation.required'),
  password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max')
    .matches(/\d/, 'validation.password.digit')
    .matches(/[a-z]/, 'validation.password.lowercase')
    .matches(/[A-Z]/, 'validation.password.uppercase')
    .matches(/[^\w\s]/, 'validation.password.special'),
})
