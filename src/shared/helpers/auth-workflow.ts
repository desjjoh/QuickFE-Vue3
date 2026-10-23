import type { AuthStore } from '@/shared/stores/auth'
import type { ModalStore } from '@/shared/stores/modal'
import { createOverlayWorkflow } from '@/shared/helpers/overlay-workflow'

/** Owns one modal stage, including its closing transition and originating session. */
export function createAuthWorkflow(
  auth: Pick<AuthStore, '$sessionKey' | 'user' | 'getValidCsrfToken' | 'isCurrentSession'>,
  modal: Pick<ModalStore, '$instanceKey' | 'isOpen' | 'close' | 'closeAndWait'>,
) {
  const workflow = createOverlayWorkflow(auth, modal)

  return {
    ...workflow,
    async request<T>(callback: (csrf: string) => Promise<T>): Promise<T> {
      workflow.assertCurrent()
      const csrf = await auth.getValidCsrfToken()

      workflow.assertCurrent()
      const result = await callback(csrf)

      workflow.assertCurrent()

      return result
    },
  }
}

export type AuthWorkflow = ReturnType<typeof createAuthWorkflow>
