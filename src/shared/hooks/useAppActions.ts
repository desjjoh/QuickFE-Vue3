import { useModalStore, type ModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/types/forms/sign-in'
import type { FormValues as EmailTokenRequestValues } from '@/shared/types/forms/email-token-request'
import CreateAccount from '@/shared/forms/CreateAccount.vue'
import {
  RegisterDto,
  type FormValues as CreateAccountValues,
} from '@/shared/types/forms/create-account'

import LogOutDialog from '../widgets/LogOutDialog.vue'

import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI'
import { useAuthStore, type AuthStore } from '@/stores/auth'
import type { JwtResponseDto } from '@/shared/models/token'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import type { AxiosError } from 'axios'
import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'
import { sleep } from '@/helpers/sleep.ts'

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
    await sleep(3_500)

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
        callback: register,
        callbackSubmit: async (values: SignInValues) => {
          const token: string = await authStore.getValidCsrfToken()
          const response: JwtResponseDto = await api.authentication.signIn(token, values)

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

          await api.authentication.signOut(token)

          authStore.purgeStore()
          modalStore.close()

          toastStore.addToast({
            message: t('auth.signOut.success'),
            tone: 'warning',
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
        callback: signIn,
        callbackSubmit: async (values: CreateAccountValues) => {
          const token: string = await authStore.getValidCsrfToken()

          await api.authentication.register(token, new RegisterDto(values))

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
    await api.security.requestEmailVerification(values)
  }

  async function requestPasswordReset(values: EmailTokenRequestValues): Promise<void> {
    await api.security.requestPasswordReset(values)
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
