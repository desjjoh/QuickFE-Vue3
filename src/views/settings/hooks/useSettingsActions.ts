import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI'

import { useAuthStore, type AuthStore } from '@/stores/auth'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import { type ModalStore, useModalStore } from '@/stores/modal'

import type { ChangeEmailPayload } from '@/library/types/forms/change-email'
import type { FormValues as VerifyPasswordPayload } from '@/library/types/forms/password-verification'

import PasswordVerification from '@/shared/forms/PasswordVerification.vue'
import ChangeEmail from '../forms/ChangeEmail.vue'
import ChangePassword from '../forms/ChangePassword.vue'
import type { ChangePasswordPayload } from '@/library/types/forms/change-password'
import type { JwtResponseDto } from '@/library/models/token'
import UpdateTimeZone from '../forms/UpdateTimeZone.vue'

export interface SettingsActions {
  updateEmail: () => void
  updatePassword: () => void
  deleteAccount: () => void
  updateTimezone: () => void
}

export function useSettingsActions(t: (key: string) => string) {
  const modalStore: ModalStore = useModalStore()
  const authStore: AuthStore = useAuthStore()
  const toastStore: ToastStore = useToastStore()

  const api: LocalHostAPI = useLocalHostAPI()

  function updateEmail(): void {
    modalStore.open({
      view: ChangeEmail,
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

  function updateTimezone(): void {
    modalStore.open({
      view: UpdateTimeZone,
      props: {
        callbackCanel: modalStore.close,
        callbackSubmit: async () => {},
      },
    })
  }

  return { updateEmail, deleteAccount, updatePassword, updateTimezone }
}
