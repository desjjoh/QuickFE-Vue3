import * as Yup from 'yup'

export type FormValues = { code: string }

export type MfaVerificationProps = {
  context: 'signIn' | 'enrollment'
  expiresAt: string
  callbackSubmit: (code: string) => Promise<void>
  callbackCancel: () => void
}

export const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required('validation.required')
    .matches(/^\d{6}$/, 'auth.mfa.code.invalid'),
})
