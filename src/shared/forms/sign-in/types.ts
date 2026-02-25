import * as Yup from 'yup'

export type FormValues = { email: string; password: string }
export const validationSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
})
