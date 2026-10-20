import type { AuthStore } from '@/shared/stores/auth'
import type { ModalStore } from '@/shared/stores/modal'
import { SessionChangedError } from '@/shared/helpers/session-scope'

/** Owns one modal stage, including its closing transition and originating session. */
export function createAuthWorkflow(
  auth: Pick<AuthStore, '$sessionKey' | 'user' | 'getValidCsrfToken' | 'isCurrentSession'>,
  modal: Pick<ModalStore, '$instanceKey' | 'isOpen' | 'close' | 'closeAndWait'>,
) {
  const sessionKey = auth.$sessionKey
  const userId = auth.user?.id
  const instanceKey = modal.$instanceKey
  const initiallyOpen = modal.isOpen
  let ended = false
  let transitioning = false

  const ownsInstance = () =>
    !ended &&
    auth.isCurrentSession(sessionKey) &&
    auth.user?.id === userId &&
    modal.$instanceKey === instanceKey
  const isCurrent = () => ownsInstance() && (transitioning || modal.isOpen === initiallyOpen)
  const assertCurrent = () => {
    if (!isCurrent())
      throw new SessionChangedError('Authentication workflow was replaced or canceled')
  }

  return {
    isCurrent,
    assertCurrent,
    async request<T>(callback: (csrf: string) => Promise<T>): Promise<T> {
      assertCurrent()
      const csrf = await auth.getValidCsrfToken()
      assertCurrent()
      const result = await callback(csrf)
      assertCurrent()
      return result
    },
    cancel() {
      if (!ownsInstance()) return
      ended = true
      modal.close()
    },
    complete(callback: () => void) {
      if (!isCurrent()) return
      ended = true
      modal.close()
      callback()
    },
    async transition(callback: () => void) {
      if (!isCurrent()) return
      transitioning = true
      await modal.closeAndWait()
      if (!ownsInstance()) return
      ended = true
      callback()
    },
  }
}

export type AuthWorkflow = ReturnType<typeof createAuthWorkflow>
