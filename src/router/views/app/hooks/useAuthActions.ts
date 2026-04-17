import { useModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/sign-in/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'
import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'

import LogOutDialog from '../widgets/dialogs/LogOutDialog.vue'
import { useLocalHostAPI } from '@/api/useLocalhostAPI'
import { useAuthStore } from '@/stores/auth'
import type { JwtResponseDto } from '@/models/token'
import { useToastStore } from '@/stores/toasts'

type AuthActions = {
  signIn: () => void
  signOut: () => void
  register: () => void
}

const modalStore = useModalStore()
const toastStore = useToastStore()
const authStore = useAuthStore()

const api = useLocalHostAPI()

export function useAuthActions(t: (key: string) => string): AuthActions {
  function signIn(): void {
    modalStore.open({
      view: SignIn,
      size: 'md',
      key: 'modal-signin',
      props: {
        callbackSubmit: async (values: SignInValues) => {
          const token: string = await authStore.getValidCsrfToken()
          const response: JwtResponseDto = await api.signIn(token, values)

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

          await api.signOut(token)

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
          const response: JwtResponseDto = await api.register(values)

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
    signIn,
    signOut,
    register,
  }
}
