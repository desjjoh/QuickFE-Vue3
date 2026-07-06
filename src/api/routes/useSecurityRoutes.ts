import { CsrfTokenDto, type iCsrfToken } from '@/library/models/token'
import { AxiosService } from '@/helpers/request'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

export type Tokens = { token_id: string; token: string }
export type EmailTokenRequest = { email: string }

export interface SecurityRoutes {
  csrfToken: () => Promise<CsrfTokenDto>
}

export function useSecurityRoutes(): SecurityRoutes {
  async function csrfToken(): Promise<CsrfTokenDto> {
    return instance
      .get<iCsrfToken>('security/csrf', requestConfig({ withCredentials: true }))
      .then(parseResponse(CsrfTokenDto))
  }

  return {
    csrfToken,
  }
}
