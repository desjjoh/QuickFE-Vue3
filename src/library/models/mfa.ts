import { JwtResponseDto, type iJwtResponse } from './token'
import type { EmailOtpChallenge, VerifyEmailOtpInput } from './email-otp'

export interface MfaChallengeResponse extends EmailOtpChallenge {
  mfa_required: true
}

export type SignInResponse = JwtResponseDto | MfaChallengeResponse
export type SignInApiResponse = iJwtResponse | MfaChallengeResponse
export type SignInMfaVerifyRequest = VerifyEmailOtpInput
export type UpdateMfaRequest = { enabled: boolean; password: string }
export type ConfirmMfaRequest = SignInMfaVerifyRequest

export function isMfaChallenge(
  response: SignInResponse | SignInApiResponse,
): response is MfaChallengeResponse {
  return 'mfa_required' in response && response.mfa_required === true
}

export function toSession(response: iJwtResponse): JwtResponseDto {
  return new JwtResponseDto(response)
}
