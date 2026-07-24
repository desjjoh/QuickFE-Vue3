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

import { useModalSubmit } from '@/shared/hooks/useModalSubmit.ts'
import MfaVerification from '@/shared/forms/MfaConfirmation.vue'
import type { MfaChallengeResponse } from '@/library/models/mfa'

export interface SettingsActions {
  updateEmail: () => void
  updatePassword: () => void
  deleteAccount: () => void
  updateMfa: (enabled: boolean) => void
}

export function useSettingsActions(t: (key: string) => string) {
  const modalStore: ModalStore = useModalStore()
  const authStore: AuthStore = useAuthStore()
  const toastStore: ToastStore = useToastStore()

  const api: LocalHostAPI = useLocalHostAPI()

  const { handleModalSubmit } = useModalSubmit()

  function updateEmail(): void {
    modalStore.open({
      view: ChangeEmail,
      size: 'md',
      key: 'modal-update-email',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async (values: ChangeEmailPayload) => {
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])

          await api.account.changeEmail(accessToken, csrfToken, values)

          modalStore.close()

          toastStore.addToast({
            message: t('settings.changeEmail.success'),
            tone: 'success',
          })
        }),
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
        callbackSubmit: handleModalSubmit(async (values: ChangePasswordPayload) => {
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])

          const response: JwtResponseDto = await api.account.changePassword(
            accessToken,
            csrfToken,
            values,
          )

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('settings.changePassword.success'),
            tone: 'success',
          })
        }),
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
        callbackSubmit: handleModalSubmit(async (values: VerifyPasswordPayload) => {
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])

          await api.account.deleteAccount(accessToken, csrfToken, values)

          authStore.purgeStore()
          modalStore.close()

          toastStore.addToast({
            message: t('settings.security.items.deleteAccount.success'),
            tone: 'success',
          })
        }),
      },
    })
  }

  function updateMfa(enabled: boolean): void {
    modalStore.open({
      view: PasswordVerification,
      size: 'md',
      key: `modal-${enabled ? 'enable' : 'disable'}-mfa`,
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async (values: VerifyPasswordPayload): Promise<void> => {
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])
          const challenge = await api.account.updateMfa(accessToken, csrfToken, {
            enabled,
            password: values.password,
          })
          if (!enabled) {
            await authStore.verifyToken()
            modalStore.close()
            toastStore.addToast({
              message: t('settings.security.items.twoFactor.disabled'),
              tone: 'success',
            })
            return
          }
          if (challenge) await openEnrollmentMfa(challenge)
        },
      },
    })
  }

  async function openEnrollmentMfa(challenge: MfaChallengeResponse): Promise<void> {
    await modalStore.closeAndWait()

    modalStore.open({
      view: MfaVerification,
      persistent: true,
      key: 'modal-enroll-mfa',
      props: {
        context: 'enrollment',
        expiresAt: challenge.expires_at,
        callbackCancel: modalStore.close,
        callbackSubmit: async (code: string): Promise<void> => {
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])
          await api.account.confirmMfa(accessToken, csrfToken, {
            challenge_id: challenge.challenge_id,
            code,
          })
          await authStore.verifyToken()
          modalStore.close()
          toastStore.addToast({
            message: t('settings.security.items.twoFactor.enabled'),
            tone: 'success',
          })
        },
      },
    })
  }

  return {
    updateEmail,
    deleteAccount,
    updatePassword,
    updateMfa,
  }
}
