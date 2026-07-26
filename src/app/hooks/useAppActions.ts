import type { AxiosError } from 'axios'

import { useModalStore, type ModalStore } from '@/stores/modal'
import type { FormValues as SignInValues } from '@/library/types/forms/sign-in'
import type { FormValues as EmailTokenRequestValues } from '@/library/types/forms/email-token-request'

import {
  RegisterDto,
  type FormValues as CreateAccountValues,
} from '@/library/types/forms/create-account'

import SignIn from '../forms/SignIn.vue'
import CreateAccount from '../forms/CreateAccount.vue'
import EmailTokenRequest from '../forms/EmailTokenRequest.vue'

import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI'

import { useAuthStore, type AuthStore } from '@/stores/auth'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'

import LogOutDialog from '@/app/components/dialogs/LogOutDialog.vue'
import { useSessionInterceptor } from '@/shared/hooks/useSessionInterceptor.ts'
import { useModalSubmit } from '@/shared/hooks/useModalSubmit.ts'
import { isMfaChallenge } from '@/library/models/mfa'
import type {
  EmailOtpChallenge as EmailOtpChallengeModel,
  RegistrationChallenge,
  VerifyEmailOtpInput,
} from '@/library/models/email-otp'
import EmailOtpChallenge from '@/shared/forms/EmailOtpChallenge.vue'
import ResetPassword from '@/app/forms/ResetPassword.vue'
import type { FormValues as ResetPasswordValues } from '@/library/types/forms/reset-password'
import type { PasswordResetAuthorization } from '@/api/routes/useAuthRoutes'

type PasswordResetState =
  | { step: 'requestingEmail' }
  | { step: 'awaitingOtp'; email: string }
  | ({ step: 'awaitingNewPassword'; email: string } & PasswordResetAuthorization)

export interface AppActions {
  initialize: () => Promise<void>
  signIn: () => void
  signOut: () => void
  register: () => void
  forgotPassword: () => void
  resendRegistration: () => void
  requestPasswordReset: (values: EmailTokenRequestValues) => Promise<void>
}

const modalStore: ModalStore = useModalStore()
const toastStore: ToastStore = useToastStore()

const authStore: AuthStore = useAuthStore()
const libraryStore: LibraryStore = useLibraryStore()

const api: LocalHostAPI = useLocalHostAPI()

export function useAppActions(t: (key: string) => string): AppActions {
  const { handleModalSubmit } = useModalSubmit()

  let passwordResetState: PasswordResetState = { step: 'requestingEmail' }

  function clearPasswordResetState(): void {
    passwordResetState = { step: 'requestingEmail' }
  }

  async function initialize(): Promise<void> {
    useSessionInterceptor()

    await libraryStore.hydrateLibrary()

    await authStore.initialize().catch((error: AxiosError) => {
      console.warn(error.message)
    })
  }

  async function openSignInMfa(
    challenge: Extract<
      Awaited<ReturnType<typeof api.authentication.signIn>>,
      { mfa_required: true }
    >,
  ): Promise<void> {
    await modalStore.closeAndWait()
    modalStore.open({
      view: EmailOtpChallenge,
      key: 'modal-signin-mfa',
      persistent: true,
      props: {
        challenge,
        title: t('auth.mfa.signIn.title'),
        description: t('auth.mfa.signIn.description'),
        onCancel: modalStore.close,
        verify: async (input: VerifyEmailOtpInput) => {
          const token = await authStore.getValidCsrfToken()
          return api.authentication.verifyMfa(token, input)
        },
        onSuccess: (response: Awaited<ReturnType<typeof api.authentication.verifyMfa>>) => {
          authStore.authenticate(response)
          modalStore.close()
          toastStore.addToast({ message: t('auth.signIn.success'), tone: 'success' })
        },
      },
    })
  }

  function signIn(): void {
    modalStore.open({
      view: SignIn,
      size: 'md',
      key: 'modal-signin',
      props: {
        callbackForgotPassword: async (): Promise<void> => {
          await modalStore.closeAndWait()
          forgotPassword()
        },
        callbackResendRegistration: async (): Promise<void> => {
          await modalStore.closeAndWait()
          resendRegistration()
        },
        callback: async (): Promise<void> => {
          await modalStore.closeAndWait()

          register()
        },
        callbackSubmit: handleModalSubmit(async (values: SignInValues) => {
          const token: string = await authStore.getValidCsrfToken()
          const response = await api.authentication.signIn(token, values)

          if (isMfaChallenge(response)) {
            await openSignInMfa(response)
            return
          }

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('auth.signIn.success'),
            tone: 'success',
          })
        }),
      },
    })
  }

  function signOut(): void {
    modalStore.open({
      view: LogOutDialog,
      size: 'sm',
      key: 'modal-signout',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async () => {
          const token: string = await authStore.getValidCsrfToken()

          await api.authentication.signOut(token).then(() => {
            authStore.purgeStore()
            modalStore.close()

            toastStore.addToast({
              message: t('auth.signOut.success'),
              tone: 'warning',
            })
          })
        }),
      },
    })
  }

  function register(): void {
    modalStore.open({
      view: CreateAccount,
      size: 'md',
      key: 'modal-register',
      props: {
        callback: async (): Promise<void> => {
          await modalStore.closeAndWait()

          signIn()
        },
        callbackSubmit: handleModalSubmit(async (values: CreateAccountValues) => {
          const token: string = await authStore.getValidCsrfToken()

          const challenge = await api.authentication.registration.request(
            token,
            new RegisterDto(values),
          )
          await openRegistrationOtp(challenge)
        }),
      },
    })
  }

  async function openRegistrationOtp(challenge: RegistrationChallenge): Promise<void> {
    await modalStore.closeAndWait()
    modalStore.open({
      view: EmailOtpChallenge,
      persistent: true,
      key: `registration-otp-${challenge.challenge_id}`,
      props: {
        challenge,
        email: challenge.email,
        title: t('auth.mfa.registration.title'),
        description: t('auth.mfa.registration.description'),
        onCancel: modalStore.close,
        restart: register,
        resend: async (): Promise<EmailOtpChallengeModel> => {
          const token = await authStore.getValidCsrfToken()
          return api.authentication.registration.resend(token, { email: challenge.email })
        },
        verify: async (input: VerifyEmailOtpInput) => {
          const token = await authStore.getValidCsrfToken()
          return api.authentication.registration.confirm(token, input)
        },
        onSuccess: (
          response: Awaited<ReturnType<typeof api.authentication.registration.confirm>>,
        ) => {
          authStore.authenticate(response)
          modalStore.close()
          toastStore.addToast({ message: t('auth.createAccount.success'), tone: 'success' })
        },
      },
    })
  }

  function forgotPassword(): void {
    clearPasswordResetState()

    modalStore.open({
      view: EmailTokenRequest,
      key: 'modal-password-reset-email',
      props: {
        kind: 'passwordResetFlow.request',
        callbackSubmit: requestPasswordReset,
        callbackCancel: async () => {
          clearPasswordResetState()

          await modalStore.closeAndWait()

          signIn()
        },
      },
    })
  }

  async function openPasswordResetOtp(email: string): Promise<void> {
    await modalStore.closeAndWait()

    modalStore.open({
      view: EmailOtpChallenge,
      key: 'modal-password-reset-otp',
      persistent: true,
      props: {
        email,
        title: t('auth.passwordResetFlow.otp.title'),
        description: t('auth.passwordResetFlow.otp.description'),
        onCancel: () => {
          clearPasswordResetState()
          modalStore.close()
        },
        verify: async ({ code }: VerifyEmailOtpInput) => {
          const token = await authStore.getValidCsrfToken()

          return api.authentication.passwordReset.verify(token, { email, code })
        },
        onSuccess: async (result: PasswordResetAuthorization) => {
          passwordResetState = {
            step: 'awaitingNewPassword',
            email,
            ...result,
          }

          await openNewPassword()
        },
      },
    })
  }

  async function openNewPassword(): Promise<void> {
    if (passwordResetState.step !== 'awaitingNewPassword') return

    await modalStore.closeAndWait()

    modalStore.open({
      view: ResetPassword,
      key: 'modal-password-reset-password',
      persistent: true,
      props: {
        callbackCancel: () => {
          clearPasswordResetState()
          modalStore.close()
        },
        callbackSubmit: async (values: ResetPasswordValues) => {
          if (passwordResetState.step !== 'awaitingNewPassword') return

          const token = await authStore.getValidCsrfToken()

          await api.authentication.passwordReset.confirm(token, passwordResetState.challenge_id, {
            authorization: passwordResetState.authorization,
            password: values.password,
            confirm: values.confirmPassword,
          })

          clearPasswordResetState()

          await modalStore.closeAndWait()

          signIn()
        },
      },
    })
  }

  function resendRegistration(): void {
    modalStore.open({
      view: EmailTokenRequest,
      key: 'modal-resend-registration',
      props: {
        kind: 'resendVerificationEmail',
        callbackSubmit: async (values: EmailTokenRequestValues): Promise<void> => {
          const token = await authStore.getValidCsrfToken()
          const challenge = await api.authentication.registration.resend(token, values)
          await openRegistrationOtp(challenge)
        },
      },
    })
  }

  async function requestPasswordReset(values: EmailTokenRequestValues): Promise<void> {
    const token: string = await authStore.getValidCsrfToken()
    const email = values.email.trim()

    await api.authentication.passwordReset.request(token, { email })

    passwordResetState = { step: 'awaitingOtp', email }

    await openPasswordResetOtp(email)
  }

  return {
    initialize,
    signIn,
    signOut,
    register,
    forgotPassword,
    resendRegistration,
    requestPasswordReset,
  }
}
