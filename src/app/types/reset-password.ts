import * as Yup from 'yup'

export type FormValues = { password: string; confirmPassword: string }
export type ResetPasswordPayload = {
  authorization: string
  password: string
  confirm: string
}

export const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max')
    .matches(/\d/, 'validation.password.digit')
    .matches(/[a-z]/, 'validation.password.lowercase')
    .matches(/[A-Z]/, 'validation.password.uppercase')
    .matches(/[^\w\s]/, 'validation.password.special'),
  confirmPassword: Yup.string()
    .required('validation.required')
    .oneOf([Yup.ref('password')], 'validation.password.match'),
})

export function normalizePasswordResetCode(value?: string): string {
  return (value ?? '').replace(/\D/g, '').slice(0, 6)
}

export function isPasswordResetCodeComplete(value: string): boolean {
  return /^\d{6}$/.test(value)
}
