import * as Yup from 'yup'

export type FormValues = { email: string; confirm: string }

export type ChangeEmailPayload = FormValues & { password: string }

export type ChangeEmailFormProps = {
  callbackSubmit: (values: FormValues) => Promise<void>
  callbackCancel?: () => void
}

export const validationSchema = Yup.object().shape({
  email: Yup.string().required('validation.required').email('validation.email'),
  confirm: Yup.string()
    .required('validation.required')
    .oneOf([Yup.ref('email')], 'validation.password.match'), // TODO : Replace with validation Email match
  password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max'),
})
