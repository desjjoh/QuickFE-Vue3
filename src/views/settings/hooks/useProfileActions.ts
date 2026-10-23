import { useLocalHostAPI, type LocalHostAPI } from '@/shared/api/useLocalhostAPI'

import { useAuthStore, type AuthStore } from '@/shared/stores/auth'
import { useToastStore, type ToastStore } from '@/shared/stores/toasts'
import { type ModalStore, useModalStore } from '@/shared/stores/modal'
import { useLibraryStore, type LibraryStore } from '@/shared/stores/library.ts'

import {
  TimezonePayload,
  type FormValues as UpdateTimeZonePayload,
} from '../types/update-timezone.ts'
import { CountryPayload, type FormValues as UpdateCountryPayload } from '../types/update-country.ts'

import UpdateTimeZone from '../forms/UpdateTimeZone.vue'
import type { UserDto } from '@/library/models/user.ts'
import UpdateCountry from '../forms/UpdateCountry.vue'

import type { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference.ts'
import UpdateProfile from '../forms/UpdateProfile.vue'
import UploadAvatar from '../forms/UploadAvatar.vue'
import { ProfilePayload, type FormValues as UpdateProfilePayload } from '../types/update-profile.ts'
import PhoneDetails from '../forms/PhoneDetails.vue'
import AddressDetails from '../forms/AddressDetails.vue'
import {
  AddressChangeDto,
  type AddressChangeInitialValues,
  type FormValues as AddressChangePayload,
} from '../types/address-change.ts'
import type { PhoneDetailsInitialValues, PhonePayload } from '../types/phone-details.ts'
import ConfirmAction from '@/shared/forms/ConfirmAction.vue'
import { createIdempotentActionOptions } from '@/shared/helpers/idempotency'
import { createSessionScope } from '@/shared/helpers/session-scope'
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
    const session = createSessionScope(authStore)
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
        callbackSubmit: handleModalSubmit(
          async (values: UpdateCountryPayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const response: UserDto = await api.account.profile.updateCountry(
              accessToken,
              csrfToken,
              new CountryPayload(values),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.regionCountry.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  function updateTimezone(user: UserDto): void {
    const session = createSessionScope(authStore)
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
        callbackSubmit: handleModalSubmit(
          async (values: UpdateTimeZonePayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const response: UserDto = await api.account.profile.updateTimeZone(
              accessToken,
              csrfToken,
              new TimezonePayload(values),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.regionTimeZone.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  function updateProfileDetails(user: UserDto): void {
    const session = createSessionScope(authStore)
    const profile = user.profile

    const userGender = libraryStore.genders.find(
      (value: GenderDto) => value.key === user.profile.personal.gender.key,
    )

    modalStore.open({
      view: UpdateProfile,
      size: 'md',
      key: 'modal-update-profile-details',
      props: {
        initialValues: {
          firstName: profile.name.first,
          lastName: profile.name.last,
          preferredName: profile.name.preferred ?? null,
          dob: profile.personal.dob,
          gender: userGender,
          bio: profile.personal.bio ?? null,
        } as UpdateProfilePayload,
        callback: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async (values: UpdateProfilePayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const response: UserDto = await api.account.profile.updateProfile(
              accessToken,
              csrfToken,
              new ProfilePayload(values),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.profileInformation.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  function updatePhone(user: UserDto): void {
    const session = createSessionScope(authStore)
    const getOptions = createIdempotentActionOptions()

    modalStore.open({
      view: PhoneDetails,
      size: 'md',
      key: 'modal-update-phone',
      props: {
        initialValues: {
          phone: user.profile.contact.phone ?? undefined,
        } as PhoneDetailsInitialValues,
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async (values: PhonePayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const response: UserDto = await api.account.profile.updatePhone(
              accessToken,
              csrfToken,
              values,
              getOptions(values),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.phoneDetails.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  async function deletePhone(): Promise<void> {
    const session = createSessionScope(authStore)
    const getOptions = createIdempotentActionOptions()

    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: 'modal-delete-phone',
      props: {
        tone: 'danger',
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async () => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()
            const response: UserDto = await api.account.profile.deletePhone(
              accessToken,
              csrfToken,
              getOptions({}),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.phoneDetails.deleteSuccess'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  function updateAddress(user: UserDto): void {
    const session = createSessionScope(authStore)
    const getOptions = createIdempotentActionOptions()
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
        callbackSubmit: handleModalSubmit(
          async (values: AddressChangePayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const payload = new AddressChangeDto(values)
            const response: UserDto = await api.account.profile.updateAddress(
              accessToken,
              csrfToken,
              payload,
              getOptions(payload),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.addressDetails.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  async function deleteAddress(): Promise<void> {
    const session = createSessionScope(authStore)
    const getOptions = createIdempotentActionOptions()

    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: 'modal-delete-address',
      props: {
        tone: 'danger',
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async () => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()
            const response: UserDto = await api.account.profile.deleteAddress(
              accessToken,
              csrfToken,
              getOptions({}),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.addressDetails.deleteSuccess'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  function updateAvatar(): void {
    const session = createSessionScope(authStore)
    const getOptions = createIdempotentActionOptions()

    modalStore.open({
      view: UploadAvatar,
      size: 'md',
      key: 'modal-update-avatar',
      props: {
        callback: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async (avatar: File) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const response: UserDto = await api.account.profile.uploadAvatar(
              accessToken,
              csrfToken,
              avatar,
              getOptions({}, avatar),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.uploadAvatar.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  async function deleteAvatar(): Promise<void> {
    const session = createSessionScope(authStore)
    const getOptions = createIdempotentActionOptions()

    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: 'modal-delete-avatar',
      props: {
        tone: 'danger',
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async () => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()
            const response: UserDto = await api.account.profile.deleteAvatar(
              accessToken,
              csrfToken,
              getOptions({}),
            )

            session.assertCurrent()

            authStore.updateAuthenticatedUser(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.uploadAvatar.deleteSuccess'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
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
