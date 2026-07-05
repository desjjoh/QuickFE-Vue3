import { AxiosService } from '@/helpers/request'

import type { ChangeEmailPayload } from '@/library/types/forms/change-email'
import type { ChangePasswordPayload } from '@/library/types/forms/change-password'
import type { FormValues as VerifyPasswordPayload } from '@/library/types/forms/password-verification'

import { instance } from '../useLocalhostAPI'
import { JwtResponseDto } from '@/library/models/token'
import type { TimezonePayload } from '@/library/types/forms/update-timezone'
import type { CountryPayload } from '@/library/types/forms/update-country'
import type { ProfilePayload } from '@/library/types/forms/update-profile'
import type { AddressChangeDto } from '@/library/types/forms/address-change'
import type { PhonePayload } from '@/library/types/forms/phone-details'

const { requestConfig, parseResponse } = AxiosService

export interface AccountRoutes {
  changeEmail: (csrfToken: string, payload: ChangeEmailPayload) => Promise<void>
  changePassword: (csrfToken: string, payload: ChangePasswordPayload) => Promise<JwtResponseDto>
  deleteAccount: (csrfToken: string, payload: VerifyPasswordPayload) => Promise<void>
  profile: AccountProfileRoutes
}

export function useAccountRoutes(): AccountRoutes {
  const profile: AccountProfileRoutes = useAccountProfileRoutes()

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
    profile,
  }
}

export interface AccountProfileRoutes {
  updateProfile: (csrfToken: string, payload: ProfilePayload) => Promise<JwtResponseDto>
  updateCountry: (csrfToken: string, payload: CountryPayload) => Promise<JwtResponseDto>
  updateTimeZone: (csrfToken: string, payload: TimezonePayload) => Promise<JwtResponseDto>
  updatePhone: (csrfToken: string, payload: PhonePayload) => Promise<JwtResponseDto>
  deletePhone: (csrfToken: string) => Promise<JwtResponseDto>
  updateAddress: (csrfToken: string, payload: AddressChangeDto) => Promise<JwtResponseDto>
  deleteAddress: (csrfToken: string) => Promise<JwtResponseDto>
}

export function useAccountProfileRoutes(): AccountProfileRoutes {
  async function updateProfile(
    csrfToken: string,
    payload: ProfilePayload,
  ): Promise<JwtResponseDto> {
    return instance
      .patch<JwtResponseDto>(
        'account/profile',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function updateCountry(
    csrfToken: string,
    payload: CountryPayload,
  ): Promise<JwtResponseDto> {
    return instance
      .put<JwtResponseDto>(
        'account/profile/country',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function updateTimeZone(
    csrfToken: string,
    payload: TimezonePayload,
  ): Promise<JwtResponseDto> {
    return instance
      .put<JwtResponseDto>(
        'account/profile/timezone',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function updatePhone(csrfToken: string, payload: PhonePayload): Promise<JwtResponseDto> {
    return instance
      .post<JwtResponseDto>(
        'account/profile/phone',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function deletePhone(csrfToken: string): Promise<JwtResponseDto> {
    return instance
      .delete<JwtResponseDto>(
        'account/profile/phone',
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function updateAddress(
    csrfToken: string,
    payload: AddressChangeDto,
  ): Promise<JwtResponseDto> {
    return instance
      .post<JwtResponseDto>(
        'account/profile/address',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function deleteAddress(csrfToken: string): Promise<JwtResponseDto> {
    return instance
      .delete<JwtResponseDto>(
        'account/profile/address',
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  return {
    updateProfile,
    updateTimeZone,
    updateCountry,
    updatePhone,
    deletePhone,
    updateAddress,
    deleteAddress,
  }
}
