import { type ModalStore, useModalStore } from '@/stores/modal'
import { useToastStore, type ToastStore } from '@/stores/toasts'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

type ModalSubmitCallback<Args extends unknown[]> = (...args: Args) => Promise<void>

export function useModalSubmit() {
  const modalStore: ModalStore = useModalStore()
  const toastStore: ToastStore = useToastStore()
  const { getErrorMessage } = useErrorMessage()

  function handleModalSubmit<Args extends unknown[]>(
    callback: ModalSubmitCallback<Args>,
  ): ModalSubmitCallback<Args> {
    return async (...args: Args): Promise<void> => {
      try {
        await callback(...args)
      } catch (error: unknown) {
        modalStore.close()

        toastStore.addToast({
          message: getErrorMessage(error),
          tone: 'danger',
        })
      }
    }
  }

  return {
    handleModalSubmit,
  }
}
