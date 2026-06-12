import { CsrfTokenDto, type iCsrfToken } from '@/models/token'

import { AxiosService } from '@/helpers/request'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

export type Tokens = { token_id: string; token: string }

export interface SecurityRoutes {
  csrfToken: () => Promise<CsrfTokenDto>
  confirmEmailVerification: (payload: Tokens) => Promise<void>
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

  return {
    csrfToken,
    confirmEmailVerification,
  }
}
