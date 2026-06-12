import { useModalStore, type ModalOptions } from '@/stores/modal'
import { useOffcanvas } from '@/stores/offcanvas'

export function useOverlayFlow() {
  const modalStore = useModalStore()
  const offcanvasStore = useOffcanvas()

  async function openModalAfterOffcanvasClose(options: ModalOptions): Promise<void> {
    await offcanvasStore.closeAndWait()
    modalStore.open(options)
  }

  return {
    openModalAfterOffcanvasClose,
  }
}
