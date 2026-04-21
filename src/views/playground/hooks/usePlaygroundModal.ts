import { useModalStore, type ModalStore } from '@/stores/modal'

import ConfirmAction from '@/shared/forms/ConfirmAction.vue'

import RevokeAccessDialog from '../components/RevokeAccessDialog.vue'
import PermanentlyDelete from '@/shared/forms/PermanentlyDelete.vue'

type PlaygroundModals = {
  confirmDialog: () => void
  revokeDialog: () => void
  deleteDialog: () => void
}

export function usePlaygroundModals(): PlaygroundModals {
  const modalStore: ModalStore = useModalStore()

  function confirmDialog(): void {
    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async () => {
          modalStore.close()
        },
      },
    })
  }

  function revokeDialog(): void {
    modalStore.open({
      view: RevokeAccessDialog,
      size: 'sm',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async () => {
          modalStore.close()
        },
      },
    })
  }

  function deleteDialog(): void {
    modalStore.open({
      view: PermanentlyDelete,
      size: 'md',
      props: {
        callbackCancel: modalStore.close,
        callbackSubmit: async () => {
          modalStore.close()
        },
      },
    })
  }

  return {
    confirmDialog,
    revokeDialog,
    deleteDialog,
  }
}
