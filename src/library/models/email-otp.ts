import type { JwtResponseDto } from './token'

export type EmailOtpMethod = 'email_otp'

export interface EmailOtpChallenge {
  challenge_id: string
  method: EmailOtpMethod
  expires_at: string
}

export interface RegistrationChallenge extends EmailOtpChallenge {
  message: string
  email: string
}

export interface VerifyEmailOtpInput {
  challenge_id: string
  code: string
}

export interface EmailOtpModalProps {
  challenge: EmailOtpChallenge
  email?: string
  title: string
  description: string
  verify: (input: VerifyEmailOtpInput) => Promise<JwtResponseDto | void>
  onSuccess: (result: JwtResponseDto | void) => void
  onCancel: () => void
}
