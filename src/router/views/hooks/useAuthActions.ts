import { useModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/sign-in/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'

import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'

type AuthActions = {
  signIn: () => void
  register: () => void
}

export function useAuthActions(): AuthActions {
  const { openModal } = useModalStore()

  function signIn(): void {
    openModal({
      view: SignIn,
      props: {
        callbackSubmit: async (values: SignInValues) => {
          console.log(values)
        },
      },
    })
  }

  function register(): void {
    openModal({
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
    register,
  }
}
