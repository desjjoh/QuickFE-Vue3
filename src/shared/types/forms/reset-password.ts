import * as Yup from 'yup'

export type FormValues = { password: string; confirmPassword: string }

export type ResetPasswordPayload = { token_id: string; token: string; password: string }

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
