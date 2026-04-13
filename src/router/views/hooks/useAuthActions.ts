import { useModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/sign-in/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'

import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'
import ConfirmAction from '@/shared/forms/confirm-action/ConfirmAction.vue'

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
      props: {
        callbackSubmit: async (values: SignInValues) => {
          console.log(values)
        },
      },
    })
  }

  function signOut(): void {
    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      props: {
        callbackSubmit: async () => {
          console.log(true)
        },
      },
    })
  }

  function register(): void {
    modalStore.open({
      view: CreateAccount,
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
