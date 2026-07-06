import * as Yup from 'yup'

export type FormValues = { code: string }

export type VerifyEmailPayload = {
  token_id: string
  token: string
  code: string
}

export const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required('validation.required')
    .matches(/^\d{6}$/, 'validation.code.sixDigits'),
})
