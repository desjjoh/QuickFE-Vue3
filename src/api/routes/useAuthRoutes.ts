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

const { parseResponse, requestConfig } = AxiosService

export type Tokens = { token: string }
export type EmailTokenRequest = { email: string }

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

type Token = { token: string }
type ValidateRequest = { token: string; code: string }

export interface RegistrationRoutes {
  request: (csrfToken: string, payload: RegisterDto) => Promise<void>
  resend: (csrfToken: string, payload: EmailTokenRequest) => Promise<void>
  validate: (csrfToken: string, token_id: string, payload: Token) => Promise<void>
  confirm: (
    csrfToken: string,
    token_id: string,
    payload: ValidateRequest,
  ) => Promise<JwtResponseDto>
}

export function useRegistrationRoutes(): RegistrationRoutes {
  async function request(csrfToken: string, payload: RegisterDto): Promise<void> {
    await instance.post<void>(
      'authentication/registration/request',
      payload,
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  async function resend(csrfToken: string, payload: EmailTokenRequest): Promise<void> {
    await instance.post<void>(
      'authentication/registration/resend',
      payload,
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  async function validate(csrfToken: string, token_id: string, payload: Token): Promise<void> {
    await instance.post<void>(
      'authentication/registration/validate',
      payload,
      requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
    )
  }

  async function confirm(
    csrfToken: string,
    token_id: string,
    payload: ValidateRequest,
  ): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>(
        'authentication/registration/confirm',
        payload,
        requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  return { request, resend, validate, confirm }
}

export interface PasswordResetRoutes {
  request: (csrfToken: string, payload: EmailTokenRequest) => Promise<void>
  validate: (csrfToken: string, token_id: string, payload: Tokens) => Promise<void>
  confirm: (csrfToken: string, token_id: string, payload: ResetPasswordPayload) => Promise<void>
}

export function usePasswordResetRoutes(): PasswordResetRoutes {
  async function request(csrfToken: string, payload: EmailTokenRequest): Promise<void> {
    await instance.post<void>(
      'authentication/password-reset/request',
      payload,
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  async function validate(csrfToken: string, token_id: string, payload: Tokens): Promise<void> {
    await instance.post<void>(
      'authentication/password-reset/validate',
      payload,
      requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
    )
  }

  async function confirm(
    csrfToken: string,
    token_id: string,
    payload: ResetPasswordPayload,
  ): Promise<void> {
    await instance.patch<void>(
      'authentication/password-reset/confirm',
      payload,
      requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
    )
  }

  return { request, validate, confirm }
}

export interface EmailVerificationRoutes {
  validate: (csrfToken: string, token_id: string, payload: Token) => Promise<void>
  confirm: (
    csrfToken: string,
    token_id: string,
    payload: ValidateRequest,
  ) => Promise<JwtResponseDto>
}

export function useEmailVerificationRoutes(): EmailVerificationRoutes {
  async function validate(csrfToken: string, token_id: string, payload: Token): Promise<void> {
    await instance.post<void>(
      'authentication/email-verification/validate',
      payload,
      requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
    )
  }

  async function confirm(
    csrfToken: string,
    token_id: string,
    payload: ValidateRequest,
  ): Promise<JwtResponseDto> {
    return instance
      .patch<iJwtResponse>(
        'authentication/email-verification/confirm',
        payload,
        requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  return { validate, confirm }
}
