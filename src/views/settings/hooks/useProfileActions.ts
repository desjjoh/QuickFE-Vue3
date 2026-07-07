import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI'

import { useAuthStore, type AuthStore } from '@/stores/auth'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import { type ModalStore, useModalStore } from '@/stores/modal'

import {
  TimezonePayload,
  type FormValues as UpdateTimeZonePayload,
} from '@/library/types/forms/update-timezone.ts'
import {
  CountryPayload,
  type FormValues as UpdateCountryPayload,
} from '@/library/types/forms/update-country.ts'

import type { JwtResponseDto } from '@/library/models/token'
import UpdateTimeZone from '../forms/UpdateTimeZone.vue'
import type { UserDto } from '@/library/models/user.ts'
import UpdateCountry from '../forms/UpdateCountry.vue'
import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'
import type { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference.ts'
import UpdateProfile from '../forms/UpdateProfile.vue'
import UploadAvatar from '../forms/UploadAvatar.vue'
import {
  ProfilePayload,
  type FormValues as UpdateProfilePayload,
} from '@/library/types/forms/update-profile.ts'
import PhoneDetails from '../forms/PhoneDetails.vue'
import AddressDetails from '../forms/AddressDetails.vue'
import {
  AddressChangeDto,
  type AddressChangeInitialValues,
  type FormValues as AddressChangePayload,
} from '@/library/types/forms/address-change.ts'
import type {
  PhoneDetailsInitialValues,
  PhonePayload,
} from '@/library/types/forms/phone-details.ts'
import ConfirmAction from '@/shared/forms/ConfirmAction.vue'
import { useModalSubmit } from '@/shared/hooks/useModalSubmit.ts'

export interface SettingsActions {
  updateCountry: (user: UserDto) => void
  updateTimezone: (user: UserDto) => void
  updateProfileDetails: (user: UserDto) => void
  updatePhone: (user: UserDto) => void
  deletePhone: () => void
  updateAddress: (user: UserDto) => void
  deleteAddress: () => void
  updateAvatar: () => void
  deleteAvatar: () => void
}

export function useSettingsActions(t: (key: string) => string) {
  const modalStore: ModalStore = useModalStore()
  const authStore: AuthStore = useAuthStore()
  const toastStore: ToastStore = useToastStore()
  const libraryStore: LibraryStore = useLibraryStore()

  const api: LocalHostAPI = useLocalHostAPI()

  const { handleModalSubmit } = useModalSubmit()

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
        callbackSubmit: handleModalSubmit(async (values: UpdateCountryPayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.updateCountry(
            csrfToken,
            new CountryPayload(values),
          )

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.regionCountry.success'),
            tone: 'success',
          })
        }),
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
        callbackSubmit: handleModalSubmit(async (values: UpdateTimeZonePayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.updateTimeZone(
            csrfToken,
            new TimezonePayload(values),
          )

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.regionTimeZone.success'),
            tone: 'success',
          })
        }),
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
          preferredName: profile.name.preferred ?? undefined,
          dob: profile.personal.dob,
          gender: userGender,
          bio: profile.personal.bio ?? undefined,
        } as UpdateProfilePayload,
        callback: modalStore.close,
        callbackSubmit: handleModalSubmit(async (values: UpdateProfilePayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.updateProfile(
            csrfToken,
            new ProfilePayload(values),
          )

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.profileInformation.success'),
            tone: 'success',
          })
        }),
      },
    })
  }

  function updatePhone(user: UserDto): void {
    modalStore.open({
      view: PhoneDetails,
      size: 'md',
      key: 'modal-update-phone',
      props: {
        initialValues: {
          phone: user.profile.contact.phone ?? undefined,
        } as PhoneDetailsInitialValues,
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async (values: PhonePayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.updatePhone(csrfToken, values)

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.phoneDetails.success'),
            tone: 'success',
          })
        }),
      },
    })
  }

  async function deletePhone(): Promise<void> {
    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: 'modal-delete-address',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async () => {
          const csrfToken: string = await authStore.getValidCsrfToken()
          const response: JwtResponseDto = await api.account.profile.deletePhone(csrfToken)

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.phoneDetails.deleteSuccess'),
            tone: 'success',
          })
        }),
      },
    })
  }

  function updateAddress(user: UserDto): void {
    const address = user.profile.contact.address
    const country = libraryStore.countries.find((value: CountryDto) => {
      return value.iso2 === address?.country || value.key === address?.country
    })
    const region = country?.regions.find((value) => value.code === address?.region.code)

    modalStore.open({
      view: AddressDetails,
      size: 'md',
      key: 'modal-update-address',
      props: {
        initialValues: {
          addressLine1: address?.address_line_1 ?? '',
          addressLine2: address?.address_line_2 ?? '',
          city: address?.city ?? '',
          country,
          region,
          postalCode: address?.postal_code ?? '',
        } as AddressChangeInitialValues,
        callback: modalStore.close,
        callbackSubmit: handleModalSubmit(async (values: AddressChangePayload) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.updateAddress(
            csrfToken,
            new AddressChangeDto(values),
          )

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.addressDetails.success'),
            tone: 'success',
          })
        }),
      },
    })
  }

  async function deleteAddress(): Promise<void> {
    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: 'modal-delete-address',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async () => {
          const csrfToken: string = await authStore.getValidCsrfToken()
          const response: JwtResponseDto = await api.account.profile.deleteAddress(csrfToken)

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.addressDetails.deleteSuccess'),
            tone: 'success',
          })
        }),
      },
    })
  }

  function updateAvatar(): void {
    modalStore.open({
      view: UploadAvatar,
      size: 'md',
      key: 'modal-update-avatar',
      props: {
        callback: modalStore.close,
        callbackSubmit: handleModalSubmit(async (avatar: File) => {
          const csrfToken: string = await authStore.getValidCsrfToken()

          const response: JwtResponseDto = await api.account.profile.uploadAvatar(csrfToken, avatar)

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.uploadAvatar.success'),
            tone: 'success',
          })
        }),
      },
    })
  }

  async function deleteAvatar(): Promise<void> {
    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: 'modal-delete-avatar',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async () => {
          const csrfToken: string = await authStore.getValidCsrfToken()
          const response: JwtResponseDto = await api.account.profile.deleteAvatar(csrfToken)

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.uploadAvatar.deleteSuccess'),
            tone: 'success',
          })
        }),
      },
    })
  }

  return {
    updateAvatar,
    deleteAvatar,
    updateProfileDetails,
    updateCountry,
    updateTimezone,
    updatePhone,
    deletePhone,
    updateAddress,
    deleteAddress,
  }
}
