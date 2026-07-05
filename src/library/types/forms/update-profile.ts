import { isValidIsoDate } from '@/helpers/date'
import type { GenderDto } from '@/library/models/reference'
import * as Yup from 'yup'

const BIO_MAX_LENGTH = 250

export type proptype = {
  initialValues?: Partial<FormValues>
  callback?: (values: FormValues) => Promise<void>
  callbackSubmit: (values: FormValues) => Promise<void>
}

export type FormValues = {
  firstName: string
  lastName: string
  preferredName?: string
  gender: GenderDto
  dob: string
  bio?: string
}

export class ProfilePayload {
  public readonly first_name: string
  public readonly last_name: string
  public readonly preferred_name: string | null
  public readonly dob: string
  public readonly gender_id: string
  public readonly bio: string | null

  constructor(payload: FormValues) {
    this.first_name = payload.firstName.trim()
    this.last_name = payload.lastName.trim()
    this.preferred_name = payload.preferredName ?? null
    this.dob = payload.dob
    this.gender_id = payload.gender.id
    this.bio = payload.bio ?? null
  }
}

export const validationSchema = Yup.object().shape({
  firstName: Yup.string().trim().required('validation.required'),
  lastName: Yup.string().trim().required('validation.required'),
  preferredName: Yup.string().trim().optional(),
  gender: Yup.mixed<GenderDto>().required('validation.required'),
  dob: Yup.string()
    .required('validation.required')
    .test('valid-date', 'validation.date', isValidIsoDate),
  bio: Yup.string().max(BIO_MAX_LENGTH, 'validation.bio.maxLength').trim().optional(),
})
