import type { AxiosResponse } from 'axios'

import { AxiosService } from '@/shared/helpers/request'
import { JwtResponseDto } from '@/library/models/token'
import { UserDto, type User } from '@/library/models/user'
import type { ChangeEmailPayload } from '@/views/settings/types/change-email'
import type { ChangePasswordPayload } from '@/views/settings/types/change-password'
import type { FormValues as VerifyPasswordPayload } from '@/shared/types/password-verification'
import type { TimezonePayload } from '@/views/settings/types/update-timezone'
import type { CountryPayload } from '@/views/settings/types/update-country'
import type { ProfilePayload } from '@/views/settings/types/update-profile'
import type { AddressChangeDto } from '@/views/settings/types/address-change'
import type { PhonePayload } from '@/views/settings/types/phone-details'
import type {
  ConfirmMfaRequest,
  MfaChallengeResponse,
  UpdateMfaRequest,
} from '@/library/models/mfa'
import type { EmailOtpChallenge, VerifyEmailOtpInput } from '@/library/models/email-otp'
import {
  AuditDto,
  type AccountActivityResponse,
  type AuditOutcome,
  type CurrentUserActivityRecord,
} from '@/library/models/audit'
import { PaginatedDto, type Paginated } from '@/library/models/pagination'

import { instance } from '../useLocalhostAPI'

const { requestConfig, parseResponse } = AxiosService

export interface AccountRoutes {
  profile: AccountProfileRoutes
  changeEmail: (
    accessToken: string,
    csrfToken: string,
    payload: ChangeEmailPayload,
  ) => Promise<EmailOtpChallenge>
  confirmEmail: (
    accessToken: string,
    csrfToken: string,
    payload: VerifyEmailOtpInput,
  ) => Promise<JwtResponseDto>
  activity: (
    accessToken: string,
    csrfToken: string,
    query?: AccountActivityQuery,
  ) => Promise<AccountActivityResponse>
  changePassword: (
    accessToken: string,
    csrfToken: string,
    payload: ChangePasswordPayload,
  ) => Promise<JwtResponseDto>
  deleteAccount: (
    accessToken: string,
    csrfToken: string,
    payload: VerifyPasswordPayload,
  ) => Promise<void>
  updateMfa: (
    accessToken: string,
    csrfToken: string,
    payload: UpdateMfaRequest,
  ) => Promise<void | MfaChallengeResponse>
  confirmMfa: (accessToken: string, csrfToken: string, payload: ConfirmMfaRequest) => Promise<void>
}

export interface AccountActivityQuery {
  domain?: string
  event?: string
  outcome?: AuditOutcome
  occurredFrom?: string
  occurredTo?: string
  page?: number
  take?: number
}

export function useAccountRoutes(): AccountRoutes {
  const profile = useAccountProfileRoutes()
  const protectedConfig = (accessToken: string, csrfToken: string) =>
    requestConfig({ token: accessToken, withCredentials: true, csrfToken })

  async function deleteAccount(
    accessToken: string,
    csrfToken: string,
    payload: VerifyPasswordPayload,
  ): Promise<void> {
    await instance.post<void>('account/delete', payload, protectedConfig(accessToken, csrfToken))
  }

  async function changeEmail(
    accessToken: string,
    csrfToken: string,
    payload: ChangeEmailPayload,
  ): Promise<EmailOtpChallenge> {
    const response = await instance.post<EmailOtpChallenge>(
      'account/email',
      payload,
      protectedConfig(accessToken, csrfToken),
    )
    return response.data
  }

  async function changePassword(
    accessToken: string,
    csrfToken: string,
    payload: ChangePasswordPayload,
  ): Promise<JwtResponseDto> {
    return instance
      .patch<JwtResponseDto>('account/password', payload, protectedConfig(accessToken, csrfToken))
      .then(parseResponse(JwtResponseDto))
  }

  async function confirmEmail(
    accessToken: string,
    csrfToken: string,
    payload: VerifyEmailOtpInput,
  ): Promise<JwtResponseDto> {
    return instance
      .patch<JwtResponseDto>(
        'account/email/confirm',
        payload,
        protectedConfig(accessToken, csrfToken),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function activity(
    accessToken: string,
    csrfToken: string,
    query: AccountActivityQuery = {},
  ): Promise<AccountActivityResponse> {
    return instance
      .get<Paginated<CurrentUserActivityRecord>>('account/activity', {
        ...protectedConfig(accessToken, csrfToken),
        params: query,
      })
      .then(({ data }) => new PaginatedDto(data, AuditDto))
  }

  async function updateMfa(
    accessToken: string,
    csrfToken: string,
    payload: UpdateMfaRequest,
  ): Promise<void | MfaChallengeResponse> {
    const response = await instance.patch<MfaChallengeResponse>(
      'account/mfa',
      payload,
      protectedConfig(accessToken, csrfToken),
    )
    return response.data?.mfa_required ? response.data : undefined
  }

  async function confirmMfa(
    accessToken: string,
    csrfToken: string,
    payload: ConfirmMfaRequest,
  ): Promise<void> {
    await instance.post<void>(
      'account/mfa/confirm',
      payload,
      protectedConfig(accessToken, csrfToken),
    )
  }

  return {
    changeEmail,
    confirmEmail,
    activity,
    changePassword,
    deleteAccount,
    updateMfa,
    confirmMfa,
    profile,
  }
}

export interface AccountProfileRoutes {
  updateProfile: (
    accessToken: string,
    csrfToken: string,
    payload: ProfilePayload,
  ) => Promise<UserDto>
  uploadAvatar: (accessToken: string, csrfToken: string, avatar: File) => Promise<UserDto>
  deleteAvatar: (accessToken: string, csrfToken: string) => Promise<UserDto>
  updateCountry: (
    accessToken: string,
    csrfToken: string,
    payload: CountryPayload,
  ) => Promise<UserDto>
  updateTimeZone: (
    accessToken: string,
    csrfToken: string,
    payload: TimezonePayload,
  ) => Promise<UserDto>
  updatePhone: (accessToken: string, csrfToken: string, payload: PhonePayload) => Promise<UserDto>
  deletePhone: (accessToken: string, csrfToken: string) => Promise<UserDto>
  updateAddress: (
    accessToken: string,
    csrfToken: string,
    payload: AddressChangeDto,
  ) => Promise<UserDto>
  deleteAddress: (accessToken: string, csrfToken: string) => Promise<UserDto>
}

export function useAccountProfileRoutes(): AccountProfileRoutes {
  const protectedConfig = (accessToken: string, csrfToken: string, contentType?: string) =>
    requestConfig({ token: accessToken, withCredentials: true, csrfToken, contentType })

  const userResponse = (request: Promise<AxiosResponse<User>>): Promise<UserDto> =>
    request.then(parseResponse(UserDto))

  const updateProfile = (
    accessToken: string,
    csrfToken: string,
    payload: ProfilePayload,
  ): Promise<UserDto> => {
    return userResponse(
      instance.patch<User>('account/profile', payload, protectedConfig(accessToken, csrfToken)),
    )
  }

  const uploadAvatar = (accessToken: string, csrfToken: string, avatar: File): Promise<UserDto> => {
    const formData = new FormData()
    formData.append('avatar', avatar)

    return userResponse(
      instance.post<User>(
        'account/profile/avatar',
        formData,
        protectedConfig(accessToken, csrfToken, 'multipart/form-data'),
      ),
    )
  }

  const deleteAvatar = (accessToken: string, csrfToken: string): Promise<UserDto> => {
    return userResponse(
      instance.delete<User>('account/profile/avatar', protectedConfig(accessToken, csrfToken)),
    )
  }

  const updateCountry = (
    accessToken: string,
    csrfToken: string,
    payload: CountryPayload,
  ): Promise<UserDto> => {
    return userResponse(
      instance.put<User>(
        'account/profile/country',
        payload,
        protectedConfig(accessToken, csrfToken),
      ),
    )
  }

  const updateTimeZone = (
    accessToken: string,
    csrfToken: string,
    payload: TimezonePayload,
  ): Promise<UserDto> => {
    return userResponse(
      instance.put<User>(
        'account/profile/timezone',
        payload,
        protectedConfig(accessToken, csrfToken),
      ),
    )
  }

  const updatePhone = (
    accessToken: string,
    csrfToken: string,
    payload: PhonePayload,
  ): Promise<UserDto> => {
    return userResponse(
      instance.post<User>(
        'account/profile/phone',
        payload,
        protectedConfig(accessToken, csrfToken),
      ),
    )
  }

  const deletePhone = (accessToken: string, csrfToken: string): Promise<UserDto> => {
    return userResponse(
      instance.delete<User>('account/profile/phone', protectedConfig(accessToken, csrfToken)),
    )
  }

  const updateAddress = (
    accessToken: string,
    csrfToken: string,
    payload: AddressChangeDto,
  ): Promise<UserDto> => {
    return userResponse(
      instance.post<User>(
        'account/profile/address',
        payload,
        protectedConfig(accessToken, csrfToken),
      ),
    )
  }

  const deleteAddress = (accessToken: string, csrfToken: string): Promise<UserDto> =>
    userResponse(
      instance.delete<User>('account/profile/address', protectedConfig(accessToken, csrfToken)),
    )

  return {
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    updateTimeZone,
    updateCountry,
    updatePhone,
    deletePhone,
    updateAddress,
    deleteAddress,
  }
}
