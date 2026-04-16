import { useModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/sign-in/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'
import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'

import LogOutDialog from '../widgets/dialogs/LogOutDialog.vue'

type AuthActions = {
  signIn: () => void
  signOut: () => void
  register: () => void
}

export function useAuthActions(): AuthActions {
  const modalStore = useModalStore()

  function signIn(): void {
    modalStore.open({
      view: SignIn,
      size: 'md',
      key: 'modal-signin',
      props: {
        callbackSubmit: async (values: SignInValues) => {
          console.log(values)
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
        callbackSubmit: async () => {
          console.log(true)
        },
        callbackCancel: modalStore.close,
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
          console.log(values)
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
