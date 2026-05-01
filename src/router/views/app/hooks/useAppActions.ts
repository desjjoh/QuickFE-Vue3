import { useModalStore, type ModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/types/forms/sign-in'
import CreateAccount from '@/shared/forms/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/types/forms/create-account'

import LogOutDialog from '../widgets/dialogs/LogOutDialog.vue'
import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI'
import { useAuthStore, type AuthStore } from '@/stores/auth'
import type { JwtResponseDto } from '@/models/token'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import type { AxiosError } from 'axios'

export interface AppActions {
  initialize: () => Promise<void>
  signIn: () => void
  signOut: () => void
  register: () => void
}

const modalStore: ModalStore = useModalStore()
const toastStore: ToastStore = useToastStore()
const authStore: AuthStore = useAuthStore()

const api: LocalHostAPI = useLocalHostAPI()

export function useAppActions(t: (key: string) => string): AppActions {
  async function initialize(): Promise<void> {
    await authStore.initialize().catch((error: AxiosError) => {
      console.log(error)

      const data = error.response?.data as { message?: string | string[] } | undefined
      const message = Array.isArray(data?.message)
        ? (data.message[0] ?? error.message)
        : (data?.message ?? error.message)

      toastStore.addToast({
        message: message,
        tone: 'danger',
      })
    })
  }

  function signIn(): void {
    modalStore.open({
      view: SignIn,
      size: 'md',
      key: 'modal-signin',
      props: {
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
        callbackSubmit: async (values: CreateAccountValues) => {
          const response: JwtResponseDto = await api.authentication.register(values)

          authStore.authenticate(response)
          modalStore.close()

          toastStore.addToast({
            message: t('auth.createAccount.success'),
            tone: 'success',
          })
        },
      },
    })
  }

  return {
    initialize,
    signIn,
    signOut,
    register,
  }
}
