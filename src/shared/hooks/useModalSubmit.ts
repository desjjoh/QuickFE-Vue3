import { type ModalStore, useModalStore } from '@/shared/stores/modal'
import { useToastStore, type ToastStore } from '@/shared/stores/toasts'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

import { SessionChangedError, type SessionScope } from '@/shared/helpers/session-scope'

type ModalSubmitCallback<Args extends unknown[]> = (...args: Args) => Promise<void>

export function useModalSubmit() {
  const modalStore: ModalStore = useModalStore()
  const toastStore: ToastStore = useToastStore()
  const { getErrorMessage } = useErrorMessage()

  function handleModalSubmit<Args extends unknown[]>(
    callback: ModalSubmitCallback<Args>,
    options: { keepOpenOnError?: boolean; session?: SessionScope } = {},
  ): ModalSubmitCallback<Args> {
    let pending = false

    return async (...args: Args): Promise<void> => {
      if (pending) return
      pending = true

      try {
        options.session?.assertCurrent()
        await callback(...args)
      } catch (error: unknown) {
        if (
          error instanceof SessionChangedError ||
          (options.session && !options.session.isCurrent())
        )
          return
        if (!options.keepOpenOnError) modalStore.close()

        toastStore.addToast({
          message: getErrorMessage(error),
          tone: 'danger',
        })
      } finally {
        pending = false
      }
    }
  }

  return {
    handleModalSubmit,
  }
}
