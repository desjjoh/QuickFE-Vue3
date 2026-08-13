import * as Yup from 'yup'

export type proptype = {
  callbackSubmit: (values: FormValues) => Promise<void>
  callback?: (values: FormValues) => void
  callbackForgotPassword?: () => Promise<void>
  callbackResendRegistration?: () => Promise<void>
}

export type FormValues = { email: string; password: string }

export const validationSchema = Yup.object().shape({
  email: Yup.string().email('validation.email').required('validation.required'),
  password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max'),
})
