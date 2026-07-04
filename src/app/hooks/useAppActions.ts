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

import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI'

import { useAuthStore, type AuthStore } from '@/stores/auth'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'

import LogOutDialog from '@/app/components/dialogs/LogOutDialog.vue'

// import { sleep } from '@/helpers/sleep.ts'

export interface AppActions {
  initialize: () => Promise<void>
  signIn: () => void
  signOut: () => void
  register: () => void

  requestEmailVerification: (values: EmailTokenRequestValues) => Promise<void>
  requestPasswordReset: (values: EmailTokenRequestValues) => Promise<void>
}

const modalStore: ModalStore = useModalStore()
const toastStore: ToastStore = useToastStore()

const authStore: AuthStore = useAuthStore()
const libraryStore: LibraryStore = useLibraryStore()

const api: LocalHostAPI = useLocalHostAPI()

export function useAppActions(t: (key: string) => string): AppActions {
  async function initialize(): Promise<void> {
    await libraryStore.hydrateLibrary()

    await authStore.initialize().catch((error: AxiosError) => {
      console.warn(error.message)
    })
  }

  function signIn(): void {
    modalStore.open({
      view: SignIn,
      size: 'md',
      key: 'modal-signin',
      props: {
        callback: async (): Promise<void> => {
          await modalStore.closeAndWait()

          register()
        },
        callbackSubmit: async (values: SignInValues) => {
          const token: string = await authStore.getValidCsrfToken()
          const response = await api.authentication.signIn(token, values)

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

  function signOut(): void {
    modalStore.open({
      view: LogOutDialog,
      size: 'sm',
      key: 'modal-signout',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async () => {
          const token: string = await authStore.getValidCsrfToken()

          await api.authentication
            .signOut(token)
            .then(() => {
              authStore.purgeStore()
              modalStore.close()

              toastStore.addToast({
                message: t('auth.signOut.success'),
                tone: 'warning',
              })
            })
            .catch((error: AxiosError) => {
              const data = error.response?.data as { message?: string | string[] } | undefined
              const message = Array.isArray(data?.message)
                ? (data.message[0] ?? error.message)
                : (data?.message ?? error.message)

              authStore.purgeStore()
              modalStore.close()

              toastStore.addToast({
                message,
                tone: 'danger',
              })
            })
        },
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
        callbackSubmit: async (values: CreateAccountValues) => {
          const token: string = await authStore.getValidCsrfToken()

          await api.authentication.registration.request(token, new RegisterDto(values))

          modalStore.close()

          toastStore.addToast({
            message: t('auth.createAccount.success'),
            tone: 'success',
          })
        },
      },
    })
  }

  async function requestEmailVerification(values: EmailTokenRequestValues): Promise<void> {
    const token: string = await authStore.getValidCsrfToken()

    await api.authentication.registration.resend(token, values).finally(authStore.purgeStore)
  }

  async function requestPasswordReset(values: EmailTokenRequestValues): Promise<void> {
    const token: string = await authStore.getValidCsrfToken()

    await api.authentication.passwordReset.request(token, values).finally(authStore.purgeStore)
  }

  return {
    initialize,
    signIn,
    signOut,
    register,
    requestEmailVerification,
    requestPasswordReset,
  }
}
