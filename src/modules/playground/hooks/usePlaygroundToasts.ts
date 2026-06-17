import { useI18n } from 'vue-i18n'

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
  const { t } = useI18n()

  function primaryToast(): void {
    toastStore.addToast({
      message: t('playground.toast.primary'),
      tone: 'primary',
    })
  }

  function successToast(): void {
    toastStore.addToast({
      message: t('playground.toast.success'),
      tone: 'success',
    })
  }

  function warningToast(): void {
    toastStore.addToast({
      message: t('playground.toast.warning'),
      tone: 'warning',
    })
  }

  function dangerToast(): void {
    toastStore.addToast({
      message: t('playground.toast.danger'),
      tone: 'danger',
    })
  }

  function infoToast(): void {
    toastStore.addToast({
      message: t('playground.toast.info'),
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
