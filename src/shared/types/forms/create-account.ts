import type { GenderDto } from '@/models/reference'
import * as Yup from 'yup'

export type proptype = {
  callbackSubmit: (values: FormValues) => Promise<void>
}

export type FormValues = { firstName: string; lastName: string; email: string; password: string }

export const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('validation.required'),
  lastName: Yup.string().required('validation.required'),
  gender: Yup.object<GenderDto>().required('validation.required'),
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
