import { JwtResponseDto, type iJwtResponse } from '@/library/models/token'

import { AxiosService } from '@/helpers/request'

import type { FormValues as SignInValues } from '@/library/types/forms/sign-in'
import type { RegisterDto } from '@/library/types/forms/create-account'

import { instance } from '../useLocalhostAPI'
import type { ResetPasswordPayload } from '@/library/types/forms/reset-password'
import {
  isMfaChallenge,
  toSession,
  type SignInApiResponse,
  type SignInMfaVerifyRequest,
  type SignInResponse,
} from '@/library/models/mfa'
import type { RegistrationChallenge, VerifyEmailOtpInput } from '@/library/models/email-otp'

const { parseResponse, requestConfig } = AxiosService

export type Tokens = { token: string }
export type EmailTokenRequest = { email: string }
export type PasswordResetMessage = { message: string }
export type PasswordResetAuthorization = {
  challenge_id: string
  authorization: string
  expires_at: string
}

export interface AuthRoutes {
  signIn: (csrfToken: string, payload: SignInValues) => Promise<JwtResponseDto | SignInResponse>
  verifyMfa: (csrfToken: string, payload: SignInMfaVerifyRequest) => Promise<JwtResponseDto>
  verifyToken: (csrfToken: string) => Promise<JwtResponseDto>
  signOut: (csrfToken: string) => Promise<void>
  registration: RegistrationRoutes
  passwordReset: PasswordResetRoutes
  emailVerification: EmailVerificationRoutes
}

export function useAuthRoutes(): AuthRoutes {
  const registration: RegistrationRoutes = useRegistrationRoutes()
  const passwordReset: PasswordResetRoutes = usePasswordResetRoutes()
  const emailVerification: EmailVerificationRoutes = useEmailVerificationRoutes()

  async function verifyToken(csrfToken: string): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>(
        'authentication/refresh',
        {},
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function signIn(
    csrfToken: string,
    payload: SignInValues,
  ): Promise<JwtResponseDto | SignInResponse> {
    return instance
      .post<SignInApiResponse>(
        'authentication/sign-in',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then((response) =>
        isMfaChallenge(response.data) ? response.data : toSession(response.data),
      )
  }

  async function verifyMfa(
    csrfToken: string,
    payload: SignInMfaVerifyRequest,
  ): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>(
        'authentication/sign-in/mfa/verify',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function signOut(csrfToken: string): Promise<void> {
    await instance.post<void>(
      'authentication/sign-out',
      {},
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  return {
    signIn,
    verifyMfa,
    verifyToken,
    signOut,
    registration,
    passwordReset,
    emailVerification,
  }
}

export interface RegistrationRoutes {
  request: (csrfToken: string, payload: RegisterDto) => Promise<RegistrationChallenge>
  resend: (csrfToken: string, payload: EmailTokenRequest) => Promise<RegistrationChallenge>
  confirm: (csrfToken: string, payload: VerifyEmailOtpInput) => Promise<JwtResponseDto>
}

export function useRegistrationRoutes(): RegistrationRoutes {
  async function request(csrfToken: string, payload: RegisterDto): Promise<RegistrationChallenge> {
    return instance
      .post<RegistrationChallenge>(
        'authentication/registration/request',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then((response) => response.data)
  }

  async function resend(
    csrfToken: string,
    payload: EmailTokenRequest,
  ): Promise<RegistrationChallenge> {
    return instance
      .post<RegistrationChallenge>(
        'authentication/registration/resend',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then((response) => response.data)
  }

  async function confirm(csrfToken: string, payload: VerifyEmailOtpInput): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>(
        'authentication/registration/confirm',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  return { request, resend, confirm }
}

export interface PasswordResetRoutes {
  request: (csrfToken: string, payload: EmailTokenRequest) => Promise<PasswordResetMessage>
  verify: (
    csrfToken: string,
    payload: { email: string; code: string },
  ) => Promise<PasswordResetAuthorization>
  confirm: (
    csrfToken: string,
    challengeId: string,
    payload: ResetPasswordPayload,
  ) => Promise<PasswordResetMessage>
}

export function usePasswordResetRoutes(): PasswordResetRoutes {
  async function request(
    csrfToken: string,
    payload: EmailTokenRequest,
  ): Promise<PasswordResetMessage> {
    return instance
      .post<PasswordResetMessage>(
        'authentication/password-reset/request',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then((response) => response.data)
  }

  async function verify(
    csrfToken: string,
    payload: { email: string; code: string },
  ): Promise<PasswordResetAuthorization> {
    return instance
      .post<PasswordResetAuthorization>(
        'authentication/password-reset/verify',
        payload,
        requestConfig({ withCredentials: true, csrfToken, preserveSessionOnUnauthorized: true }),
      )
      .then((response) => response.data)
  }

  async function confirm(
    csrfToken: string,
    challengeId: string,
    payload: ResetPasswordPayload,
  ): Promise<PasswordResetMessage> {
    return instance
      .patch<PasswordResetMessage>(
        'authentication/password-reset/confirm',
        payload,
        requestConfig({
          params: { challenge_id: challengeId },
          withCredentials: true,
          csrfToken,
          preserveSessionOnUnauthorized: true,
        }),
      )
      .then((response) => response.data)
  }

  return { request, verify, confirm }
}

export interface EmailVerificationRoutes {
  confirm: (csrfToken: string, payload: VerifyEmailOtpInput) => Promise<JwtResponseDto>
}

export function useEmailVerificationRoutes(): EmailVerificationRoutes {
  async function confirm(csrfToken: string, payload: VerifyEmailOtpInput): Promise<JwtResponseDto> {
    return instance
      .patch<iJwtResponse>(
        'authentication/email-verification/confirm',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  return { confirm }
}
