import * as Yup from 'yup'

export type proptype = {
  callbackSubmit: (values: FormValues) => Promise<void>
  callbackCancel?: () => void
}
export type FormValues = { password: string }

export const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('validation.required')
    .min(8, 'validation.password.min')
    .max(16, 'validation.password.max'),
})
