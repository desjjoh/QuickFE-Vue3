import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI'

import { useAuthStore, type AuthStore } from '@/stores/auth'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import { type ModalStore, useModalStore } from '@/stores/modal'

import type { ChangeEmailPayload } from '@/library/types/forms/change-email'
import type { FormValues as VerifyPasswordPayload } from '@/library/types/forms/password-verification'
import {
  TimezonePayload,
  type FormValues as UpdateTimeZonePayload,
} from '@/library/types/forms/update-timezone.ts'
import {
  CountryPayload,
  type FormValues as UpdateCountryPayload,
} from '@/library/types/forms/update-country.ts'

import PasswordVerification from '@/shared/forms/PasswordVerification.vue'
import ChangeEmail from '../forms/ChangeEmail.vue'
import ChangePassword from '../forms/ChangePassword.vue'
import type { ChangePasswordPayload } from '@/library/types/forms/change-password'
import type { JwtResponseDto } from '@/library/models/token'
import UpdateTimeZone from '../forms/UpdateTimeZone.vue'
import type { UserDto } from '@/library/models/user.ts'
import UpdateCountry from '../forms/UpdateCountry.vue'
import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'
import type { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference.ts'
import UpdateProfile from '../forms/UpdateProfile.vue'
import type { FormValues as UpdateProfilePayload } from '@/library/types/forms/update-profile.ts'

export interface SettingsActions {
  updateEmail: () => void
  updatePassword: () => void
  deleteAccount: () => void
  updateCountry: (user: UserDto) => void
  updateTimezone: (user: UserDto) => void
  updateProfileDetails: (user: UserDto) => void
}

export function useSettingsActions(t: (key: string) => string) {
  const modalStore: ModalStore = useModalStore()
  const authStore: AuthStore = useAuthStore()
  const toastStore: ToastStore = useToastStore()
  const libraryStore: LibraryStore = useLibraryStore()

  const api: LocalHostAPI = useLocalHostAPI()

  function updateEmail(): void {
    modalStore.open({
      view: ChangeEmail,
      size: 'md',
      key: 'modal-update-email',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async (values: ChangeEmailPayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          await api.account.changeEmail(csrfToken, values)

          modalStore.close()

          toastStore.addToast({
            message: t('auth.signIn.success'),
            tone: 'success',
          })
        },
      },
    })
  }

  function updatePassword(): void {
    modalStore.open({
      view: ChangePassword,
      size: 'md',
      key: 'modal-update-password',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async (values: ChangePasswordPayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.changePassword(csrfToken, values)

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('auth.signIn.success'),
            tone: 'success',
          })
        },
      },
    })
  }

  function deleteAccount(): void {
    modalStore.open({
      view: PasswordVerification,
      size: 'md',
      key: 'modal-delete-account',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async (values: VerifyPasswordPayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          await api.account.deleteAccount(csrfToken, values)

          authStore.purgeStore()
          modalStore.close()

          toastStore.addToast({
            message: t('auth.signIn.success'),
            tone: 'success',
          })
        },
      },
    })
  }

  function updateCountry(user: UserDto): void {
    const userCountry = libraryStore.countries.find(
      (value: CountryDto) => value.key === user.profile.region.country.key,
    )

    modalStore.open({
      view: UpdateCountry,
      size: 'md',
      key: 'modal-update-country',
      props: {
        initialValues: { country: userCountry } as UpdateCountryPayload,
        callback: modalStore.close,
        callbackSubmit: async (values: UpdateCountryPayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.updateCountry(
            csrfToken,
            new CountryPayload(values),
          )

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('auth.signIn.success'),
            tone: 'success',
          })
        },
      },
    })
  }

  function updateTimezone(user: UserDto): void {
    const userTimezone = libraryStore.timezones.find(
      (value: TimezoneDto) => value.key === user.profile.region.timezone.key,
    )

    modalStore.open({
      view: UpdateTimeZone,
      size: 'md',
      key: 'modal-update-timezone',
      props: {
        initialValues: { timezone: userTimezone } as UpdateTimeZonePayload,
        callback: modalStore.close,
        callbackSubmit: async (values: UpdateTimeZonePayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.updateTimeZone(
            csrfToken,
            new TimezonePayload(values),
          )

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('auth.signIn.success'),
            tone: 'success',
          })
        },
      },
    })
  }

  function updateProfileDetails(user: UserDto): void {
    const profile = user.profile
    const userGender = libraryStore.genders.find(
      (value: GenderDto) => value.key === user.profile.personal.gender,
    )

    modalStore.open({
      view: UpdateProfile,
      size: 'md',
      key: 'modal-update-profile-details',
      props: {
        initialValues: {
          firstName: profile.name.first,
          lastName: profile.name.last,
          preferredName: profile.name.preferred,
          dob: profile.personal.dob,
          gender: userGender,
          bio: profile.personal.bio,
        } as UpdateProfilePayload,
        callback: modalStore.close,
        callbackSubmit: async (values: UpdateProfilePayload) => {},
      },
    })
  }

  return {
    updateEmail,
    deleteAccount,
    updatePassword,
    updateProfileDetails,
    updateCountry,
    updateTimezone,
  }
}
