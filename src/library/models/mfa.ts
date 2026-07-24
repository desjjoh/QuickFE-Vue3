import { JwtResponseDto, type iJwtResponse } from './token'

export interface MfaChallengeResponse {
  mfa_required: true
  challenge_id: string
  method: 'email_otp'
  expires_at: string
}

export type SignInResponse = JwtResponseDto | MfaChallengeResponse
export type SignInApiResponse = iJwtResponse | MfaChallengeResponse
export type SignInMfaVerifyRequest = { challenge_id: string; code: string }
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
