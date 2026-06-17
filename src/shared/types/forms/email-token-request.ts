import * as Yup from 'yup'

export type FormValues = { email: string }

export const validationSchema = Yup.object().shape({
  email: Yup.string().email('validation.email').required('validation.required'),
})
