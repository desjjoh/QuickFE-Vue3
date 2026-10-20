import { SessionChangedError } from '@/shared/helpers/session-scope'

interface WorkflowSession {
  readonly $sessionKey: string
  readonly user: { readonly id: string } | null
  isCurrentSession: (key: string) => boolean
}

export interface WorkflowOverlay {
  readonly $instanceKey: string
  readonly isOpen: boolean
  close: () => void
  closeAndWait: () => Promise<void>
}

/** Own one opening and its session, including the intentional closing transition. */
export function createOverlayWorkflow(auth: WorkflowSession, overlay: WorkflowOverlay) {
  const sessionKey = auth.$sessionKey
  const userId = auth.user?.id
  const instanceKey = overlay.$instanceKey
  const initiallyOpen = overlay.isOpen
  let ended = false
  let transitioning = false

  const ownsInstance = () =>
    !ended &&
    auth.isCurrentSession(sessionKey) &&
    auth.user?.id === userId &&
    overlay.$instanceKey === instanceKey
  const isCurrent = () => ownsInstance() && (transitioning || overlay.isOpen === initiallyOpen)
  const assertCurrent = () => {
    if (!isCurrent()) throw new SessionChangedError('Overlay workflow was replaced or canceled')
  }

  return {
    isCurrent,
    assertCurrent,
    async request<T>(callback: () => Promise<T>): Promise<T> {
      assertCurrent()
      const result = await callback()
      assertCurrent()
      return result
    },
    cancel() {
      if (!ownsInstance()) return
      ended = true
      overlay.close()
    },
    complete(callback: () => void = () => {}) {
      if (!isCurrent()) return
      ended = true
      overlay.close()
      callback()
    },
    async transition(callback: () => void) {
      if (!isCurrent() || transitioning) return
      transitioning = true
      await overlay.closeAndWait()
      if (!ownsInstance()) return
      ended = true
      callback()
    },
  }
}
