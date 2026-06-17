import { useOffcanvas, type OffcanvasStore } from '@/stores/offcanvas'

import OffcanvasExamplePanel from '../components/OffcanvasExamplePanel.vue'

type PlaygroundOffcanvas = {
  openRight: () => void
  openLeft: () => void
  openTop: () => void
  openBottom: () => void
}

export function usePlaygroundOffcanvas(): PlaygroundOffcanvas {
  const offcanvas: OffcanvasStore = useOffcanvas()

  function openRight(): void {
    offcanvas.open({
      view: OffcanvasExamplePanel,
      side: 'right',
      size: 'md',
      persistent: false,
      key: 'offcanvas-right',
    })
  }

  function openLeft(): void {
    offcanvas.open({
      view: OffcanvasExamplePanel,
      side: 'left',
      size: 'md',
      persistent: false,
      key: 'offcanvas-left',
    })
  }

  function openTop(): void {
    offcanvas.open({
      view: OffcanvasExamplePanel,
      side: 'top',
      size: 'md',
      persistent: false,
      key: 'offcanvas-top',
    })
  }

  function openBottom(): void {
    offcanvas.open({
      view: OffcanvasExamplePanel,
      side: 'bottom',
      size: 'md',
      persistent: false,
      key: 'offcanvas-bottom',
    })
  }

  return {
    openRight,
    openLeft,
    openTop,
    openBottom,
  }
}
