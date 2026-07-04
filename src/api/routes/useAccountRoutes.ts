import { AxiosService } from '@/helpers/request'

import type { ChangeEmailPayload } from '@/library/types/forms/change-email'
import type { ChangePasswordPayload } from '@/library/types/forms/change-password'
import type { FormValues as VerifyPasswordPayload } from '@/library/types/forms/password-verification'

import { instance } from '../useLocalhostAPI'
import { JwtResponseDto } from '@/library/models/token'

const { requestConfig, parseResponse } = AxiosService

export interface AccountRoutes {
  changeEmail: (csrfToken: string, payload: ChangeEmailPayload) => Promise<void>
  changePassword: (csrfToken: string, payload: ChangePasswordPayload) => Promise<JwtResponseDto>
  deleteAccount: (csrfToken: string, payload: VerifyPasswordPayload) => Promise<void>
}

export function useAccountRoutes(): AccountRoutes {
  async function deleteAccount(csrfToken: string, payload: VerifyPasswordPayload): Promise<void> {
    await instance.delete<void>('account', {
      ...requestConfig({ withCredentials: true, csrfToken }),
      data: payload,
    })
  }

  async function changeEmail(csrfToken: string, payload: ChangeEmailPayload): Promise<void> {
    await instance.post<void>(
      'account/email',
      payload,
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  async function changePassword(
    csrfToken: string,
    payload: ChangePasswordPayload,
  ): Promise<JwtResponseDto> {
    return instance
      .patch<JwtResponseDto>(
        'account/password',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  return {
    changeEmail,
    changePassword,
    deleteAccount,
  }
}
