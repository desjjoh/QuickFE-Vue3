import { CsrfTokenDto, type iCsrfToken } from '@/models/token'

import { AxiosService } from '@/helpers/request'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

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
