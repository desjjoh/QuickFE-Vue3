import { CsrfTokenDto, type iCsrfToken } from '@/models/token'

import { AxiosService } from '@/helpers/request'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

export interface AppRoutes {
  csrfToken: () => Promise<CsrfTokenDto>
}

export function useAppRoutes(): AppRoutes {
  async function csrfToken(): Promise<CsrfTokenDto> {
    return instance
      .get<iCsrfToken>('csrf', requestConfig({ withCredentials: true }))
      .then(parseResponse(CsrfTokenDto))
  }

  return {
    csrfToken,
  }
}
