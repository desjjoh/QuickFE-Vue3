import * as Yup from 'yup'

export type FormValues = { email: string }

export type EmailTokenRequestKind = 'resendVerificationEmail' | 'passwordResetToken'
export type EmailTokenRequestAction = 'requestEmailVerification' | 'requestPasswordReset'

export const validationSchema = Yup.object().shape({
  email: Yup.string().email('validation.email').required('validation.required'),
})

export type EmailTokenRequestRouteConfig = {
  kind: EmailTokenRequestKind
  action: EmailTokenRequestAction
}
