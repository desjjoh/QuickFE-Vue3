import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useAuthStore } from '@/shared/stores/auth'
import { createOverlayWorkflow } from '@/shared/helpers/overlay-workflow'
import { useOverlaySubmit } from '@/shared/hooks/useOverlaySubmit'

export function useOffcanvasSubmit() {
  const offcanvas = useOffcanvas()
  const auth = useAuthStore()
  const { handleOverlaySubmit } = useOverlaySubmit(offcanvas)

  function handleOffcanvasSubmit<Args extends unknown[]>(
    callback: (...args: Args) => Promise<void>,
    options: { keepOpenOnError?: boolean; onError?: (error: unknown) => void } = {},
  ) {
    const workflow = createWorkflow()

    return handleOverlaySubmit((...args: Args) => workflow.request(() => callback(...args)), {
      ...options,
      session: workflow,
    })
  }

  // Capture after opening the panel, before awaiting account work.
  const createWorkflow = () => createOverlayWorkflow(auth, offcanvas)

  return { handleOffcanvasSubmit, createWorkflow }
}
