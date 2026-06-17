import { CsrfTokenDto, type iCsrfToken } from '@/shared/models/token'

import { AxiosService } from '@/helpers/request'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

export type Tokens = { token_id: string; token: string }
export type EmailTokenRequest = { email: string }

export interface SecurityRoutes {
  csrfToken: () => Promise<CsrfTokenDto>
  confirmEmailVerification: (payload: Tokens) => Promise<void>
  requestEmailVerification: (payload: EmailTokenRequest) => Promise<void>
  requestPasswordReset: (payload: EmailTokenRequest) => Promise<void>
}

export function useSecurityRoutes(): SecurityRoutes {
  async function csrfToken(): Promise<CsrfTokenDto> {
    return instance
      .get<iCsrfToken>('security/csrf', requestConfig({ withCredentials: true }))
      .then(parseResponse(CsrfTokenDto))
  }

  async function confirmEmailVerification(payload: Tokens): Promise<void> {
    await instance.post<void>('security/email-verification/confirm', payload)
  }

  async function requestEmailVerification(payload: EmailTokenRequest): Promise<void> {
    await instance.post<void>('security/email-verification/resend', payload)
  }

  async function requestPasswordReset(payload: EmailTokenRequest): Promise<void> {
    await instance.post<void>('security/password-reset/request', payload)
  }

  return {
    csrfToken,
    confirmEmailVerification,
    requestEmailVerification,
    requestPasswordReset,
  }
}
