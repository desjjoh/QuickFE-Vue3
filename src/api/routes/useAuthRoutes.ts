import { JwtResponseDto, type iJwtResponse } from '@/library/models/token'

import { AxiosService } from '@/helpers/request'

import type { FormValues as SignInValues } from '@/library/types/forms/sign-in'
import type { RegisterDto } from '@/library/types/forms/create-account'

import { instance } from '../useLocalhostAPI'
import type { ResetPasswordPayload } from '@/library/types/forms/reset-password'

const { parseResponse, requestConfig } = AxiosService

export type Tokens = { token_id: string; token: string }
export type EmailTokenRequest = { email: string }

export interface AuthRoutes {
  signIn: (csrfToken: string, payload: SignInValues) => Promise<JwtResponseDto>
  verifyToken: (csrfToken: string) => Promise<JwtResponseDto>
  signOut: (csrfToken: string) => Promise<void>
  registration: RegistrationRoutes
  passwordReset: PasswordResetRoutes
}

export function useAuthRoutes(): AuthRoutes {
  const registration: RegistrationRoutes = useRegistrationRoutes()
  const passwordReset: PasswordResetRoutes = usePasswordResetRoutes()

  async function verifyToken(csrfToken: string): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>(
        'authentication/refresh',
        {},
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function signIn(csrfToken: string, payload: SignInValues): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>(
        'authentication/sign-in',
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
    verifyToken,
    signOut,
    registration,
    passwordReset,
  }
}

type Token = { token: string }
type ValidateRequest = { token: string; code: string }

export interface RegistrationRoutes {
  request: (csrfToken: string, payload: RegisterDto) => Promise<void>
  resend: (csrfToken: string, payload: EmailTokenRequest) => Promise<void>
  validate: (csrfToken: string, token_id: string, payload: Token) => Promise<void>
  confirm: (csrfToken: string, token_id: string, payload: ValidateRequest) => Promise<void>
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
  ): Promise<void> {
    await instance.post<void>(
      'authentication/registration/confirm',
      payload,
      requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
    )
  }

  return { request, resend, validate, confirm }
}

export interface PasswordResetRoutes {
  request: (csrfToken: string, payload: EmailTokenRequest) => Promise<void>
  validate: (csrfToken: string, payload: Tokens) => Promise<void>
  confirm: (csrfToken: string, payload: ResetPasswordPayload) => Promise<void>
}

export function usePasswordResetRoutes(): PasswordResetRoutes {
  async function request(csrfToken: string, payload: EmailTokenRequest): Promise<void> {
    await instance.post<void>(
      'authentication/password-reset/request',
      payload,
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  async function validate(csrfToken: string, payload: Tokens): Promise<void> {
    await instance.post<void>(
      'security/password-reset/validate',
      payload,
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  async function confirm(csrfToken: string, payload: ResetPasswordPayload): Promise<void> {
    await instance.patch<void>(
      'security/password-reset/confirm',
      payload,
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  return { request, validate, confirm }
}

export interface EmailVerificationRoutes {
  validate: (csrfToken: string, token_id: string, payload: Token) => Promise<void>
  confirm: (csrfToken: string, token_id: string, payload: ValidateRequest) => Promise<void>
}

export function useEmailVerificationRoutes(): EmailVerificationRoutes {
  async function validate(csrfToken: string, token_id: string, payload: Token): Promise<void> {
    await instance.post<void>(
      'security/password-reset/validate',
      payload,
      requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
    )
  }

  async function confirm(
    csrfToken: string,
    token_id: string,
    payload: ValidateRequest,
  ): Promise<void> {
    await instance.patch<void>(
      'security/password-reset/confirm',
      payload,
      requestConfig({ params: { token_id }, withCredentials: true, csrfToken }),
    )
  }

  return { validate, confirm }
}
