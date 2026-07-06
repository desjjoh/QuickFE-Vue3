import * as Yup from 'yup'

export type FormValues = { email: string }

export type ChangeEmailPayload = FormValues & { password: string }

export type ChangeEmailFormProps = {
  callbackSubmit: (values: FormValues) => Promise<void>
  callbackCancel?: () => void
}

export const validationSchema = Yup.object().shape({
  email: Yup.string().required('validation.required').email('validation.email'),
  password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max'),
})
