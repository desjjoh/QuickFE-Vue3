import type { JwtResponseDto } from '@/library/models/token'
import type { MfaChallengeResponse } from '@/library/models/mfa'
import type {
  EmailOtpChallenge as EmailOtpChallengeModel,
  VerifyEmailOtpInput,
} from '@/library/models/email-otp'

import { useLocalHostAPI, type LocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore, type AuthStore } from '@/shared/stores/auth'
import { useToastStore, type ToastStore } from '@/shared/stores/toasts'
import { type ModalStore, useModalStore } from '@/shared/stores/modal'
import { createSessionScope, type SessionScope } from '@/shared/helpers/session-scope'
import { useModalSubmit } from '@/shared/hooks/useModalSubmit.ts'
import EmailOtpChallenge from '@/shared/forms/EmailOtpChallenge.vue'
import PasswordVerification from '@/shared/forms/PasswordVerification.vue'
import type { FormValues as VerifyPasswordPayload } from '@/shared/types/password-verification'

import type { ChangePasswordPayload } from '../types/change-password'
import type { ChangeEmailPayload } from '../types/change-email'
import ChangeEmail from '../forms/ChangeEmail.vue'
import ChangePassword from '../forms/ChangePassword.vue'

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
    const session = createSessionScope(authStore)

    modalStore.open({
      view: ChangeEmail,
      size: 'md',
      key: 'modal-update-email',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async (values: ChangeEmailPayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const challenge = await api.account.changeEmail(accessToken, csrfToken, values)

            session.assertCurrent()
            await openEmailChangeOtp(challenge, values.email, session)
            session.assertCurrent()
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  async function openEmailChangeOtp(
    challenge: EmailOtpChallengeModel,
    email: string,
    session: SessionScope,
  ): Promise<void> {
    await modalStore.closeAndWait()
    session.assertCurrent()
    modalStore.open({
      view: EmailOtpChallenge,
      persistent: true,
      key: `email-change-otp-${challenge.challenge_id}`,
      props: {
        challenge,
        email,
        title: t('auth.mfa.emailChange.title'),
        description: t('auth.mfa.emailChange.description'),
        onCancel: modalStore.close,
        restart: updateEmail,
        verify: async (input: VerifyEmailOtpInput) => {
          session.assertCurrent()
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])

          session.assertCurrent()

          const response = await api.account.confirmEmail(accessToken, csrfToken, input)

          session.assertCurrent()

          return response
        },
        onSuccess: async (response: Awaited<ReturnType<typeof api.account.confirmEmail>>) => {
          session.assertCurrent()
          authStore.authenticate(response)
          modalStore.close()
          toastStore.addToast({ message: t('settings.changeEmail.success'), tone: 'success' })

          await authStore.verifyToken()
          session.assertCurrent()
        },
      },
    })
  }

  function updatePassword(): void {
    const session = createSessionScope(authStore)

    modalStore.open({
      view: ChangePassword,
      size: 'md',
      key: 'modal-update-password',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async (values: ChangePasswordPayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            const response: JwtResponseDto = await api.account.changePassword(
              accessToken,
              csrfToken,
              values,
            )

            session.assertCurrent()

            authStore.authenticate(response)
            modalStore.close()

            toastStore.addToast({
              message: t('settings.changePassword.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  function deleteAccount(): void {
    const session = createSessionScope(authStore)

    modalStore.open({
      view: PasswordVerification,
      size: 'md',
      key: 'modal-delete-account',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(
          async (values: VerifyPasswordPayload) => {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            session.assertCurrent()

            await api.account.deleteAccount(accessToken, csrfToken, values)
            session.assertCurrent()

            authStore.purgeStore()
            modalStore.close()

            toastStore.addToast({
              message: t('settings.security.items.deleteAccount.success'),
              tone: 'success',
            })
          },
          { keepOpenOnError: true, session },
        ),
      },
    })
  }

  function updateMfa(enabled: boolean): void {
    const session = createSessionScope(authStore)

    modalStore.open({
      view: PasswordVerification,
      size: 'md',
      key: `modal-${enabled ? 'enable' : 'disable'}-mfa`,
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async (values: VerifyPasswordPayload): Promise<void> => {
          session.assertCurrent()
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])

          session.assertCurrent()

          const challenge = await api.account.updateMfa(accessToken, csrfToken, {
            enabled,
            password: values.password,
          })

          session.assertCurrent()

          if (!enabled) {
            await authStore.verifyToken()
            session.assertCurrent()
            modalStore.close()
            toastStore.addToast({
              message: t('settings.security.items.twoFactor.disabled'),
              tone: 'success',
            })

            return
          }

          if (challenge) await openEnrollmentMfa(challenge, session)
        },
      },
    })
  }

  async function openEnrollmentMfa(
    challenge: MfaChallengeResponse,
    session: SessionScope,
  ): Promise<void> {
    await modalStore.closeAndWait()
    session.assertCurrent()

    modalStore.open({
      view: EmailOtpChallenge,
      persistent: true,
      key: 'modal-enroll-mfa',
      props: {
        challenge,
        title: t('auth.mfa.enrollment.title'),
        description: t('auth.mfa.enrollment.description'),
        onCancel: modalStore.close,
        verify: async (input: VerifyEmailOtpInput): Promise<void> => {
          session.assertCurrent()
          const [accessToken, csrfToken] = await Promise.all([
            authStore.getValidAccessToken(),
            authStore.getValidCsrfToken(),
          ])

          session.assertCurrent()
          await api.account.confirmMfa(accessToken, csrfToken, input)
          session.assertCurrent()
        },
        onSuccess: async (): Promise<void> => {
          session.assertCurrent()
          await authStore.verifyToken()
          session.assertCurrent()
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
