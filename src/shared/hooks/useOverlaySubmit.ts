import { useToastStore, type ToastStore } from '@/shared/stores/toasts'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

import { SessionChangedError, type SessionScope } from '@/shared/helpers/session-scope'

type OverlaySubmitCallback<Args extends unknown[]> = (...args: Args) => Promise<void>

export function useOverlaySubmit(overlay: { close: () => void }) {
  const toastStore: ToastStore = useToastStore()
  const { getErrorMessage } = useErrorMessage()

  function handleOverlaySubmit<Args extends unknown[]>(
    callback: OverlaySubmitCallback<Args>,
    options: {
      keepOpenOnError?: boolean
      session?: SessionScope
      onError?: (error: unknown) => void
    } = {},
  ): OverlaySubmitCallback<Args> {
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
        if (!options.keepOpenOnError) overlay.close()

        if (options.onError) {
          options.onError(error)
          return
        }
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
    handleOverlaySubmit,
  }
}
