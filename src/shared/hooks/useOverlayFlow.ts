import { useModalStore, type ModalOptions } from '@/shared/stores/modal'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useAuthStore } from '@/shared/stores/auth'
import { createOverlayWorkflow } from '@/shared/helpers/overlay-workflow'

export function useOverlayFlow() {
  const modalStore = useModalStore()
  const offcanvasStore = useOffcanvas()
  const auth = useAuthStore()

  async function afterOffcanvasClose(callback: () => void): Promise<void> {
    const modalInstance = modalStore.$instanceKey
    const workflow = createOverlayWorkflow(auth, offcanvasStore)
    await workflow.transition(() => {
      if (modalStore.$instanceKey === modalInstance) callback()
    })
  }

  async function openModalAfterOffcanvasClose(options: ModalOptions): Promise<void> {
    await afterOffcanvasClose(() => modalStore.open(options))
  }

  return { openModalAfterOffcanvasClose, afterOffcanvasClose }
}
