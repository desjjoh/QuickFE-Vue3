import { useToastStore, type ToastStore } from '@/stores/toasts'

type PlaygroundToasts = {
  primaryToast: () => void
  successToast: () => void
  warningToast: () => void
  dangerToast: () => void
  infoToast: () => void
}

export function usePlaygroundToasts(): PlaygroundToasts {
  const toastStore: ToastStore = useToastStore()

  function primaryToast(): void {
    toastStore.addToast({
      message: 'A new version is ready. Refresh to apply the latest changes.',
      tone: 'primary',
    })
  }

  function successToast(): void {
    toastStore.addToast({
      message: 'Your settings were updated successfully.',
      tone: 'success',
    })
  }

  function warningToast(): void {
    toastStore.addToast({
      message: 'You have unsaved edits. Leaving now will discard them.',
      tone: 'warning',
    })
  }

  function dangerToast(): void {
    toastStore.addToast({
      message: 'We couldn’t complete your request. Please try again.',
      tone: 'danger',
    })
  }

  function infoToast(): void {
    toastStore.addToast({
      message: 'This feature is still in beta and may change.',
      tone: 'info',
    })
  }

  return {
    primaryToast,
    successToast,
    warningToast,
    dangerToast,
    infoToast,
  }
}
