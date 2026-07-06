import * as Yup from 'yup'

export type FormValues = { new_password: string; confirm: string }

export type ChangePasswordPayload = FormValues & { password: string }

export type ChangePasswordFormProps = {
  callbackSubmit: (values: FormValues) => Promise<void>
  callbackCancel?: () => void
}

export const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max'),
  new_password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max')
    .matches(/\d/, 'validation.password.digit')
    .matches(/[a-z]/, 'validation.password.lowercase')
    .matches(/[A-Z]/, 'validation.password.uppercase')
    .matches(/[^\w\s]/, 'validation.password.special'),
  confirm: Yup.string()
    .required('validation.required')
    .oneOf([Yup.ref('new_password')], 'validation.password.match'),
})
