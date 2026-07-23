import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'

import { useLocalHostAPI, type LocalHostAPI } from '@/api/useLocalhostAPI.ts'
import { SessionDto, type UserDto } from '@/library/models/user.ts'
import { type ModalStore, useModalStore } from '@/stores/modal.ts'
import { useAuthStore, type AuthStore } from '@/stores/auth.ts'
import { useToastStore, type ToastStore } from '@/stores/toasts.ts'
import ConfirmAction from '@/shared/forms/ConfirmAction.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'
import { useModalSubmit } from '@/shared/hooks/useModalSubmit.ts'

export type SessionListItem = {
  id: string
  data: SessionDto
  isCurrent: boolean
  isStale: boolean
}

const STALE_SESSION_THRESHOLD_MS = 15 * 60 * 1000

type Sessions = {
  sessions: ComputedRef<SessionListItem[]>
  isLoading: Ref<boolean>
  loadError: Ref<string | null>
  revokingSessionId: Ref<string | null>
  isRevokingAll: Ref<boolean>
  loadSessions: () => Promise<void>
  revokeSession: (session: SessionListItem) => void
  revokeAllSessions: () => void
}

export function useSessions(user: ComputedRef<UserDto>, t: (key: string) => string): Sessions {
  const authStore: AuthStore = useAuthStore()
  const modalStore: ModalStore = useModalStore()
  const toastStore: ToastStore = useToastStore()
  const api: LocalHostAPI = useLocalHostAPI()
  const { getErrorMessage } = useErrorMessage()
  const { handleModalSubmit } = useModalSubmit()

  const sessionData = ref<SessionDto[]>([])
  const isLoading = ref(true)
  const loadError = ref<string | null>(null)
  const revokingSessionId = ref<string | null>(null)
  const isRevokingAll = ref(false)

  const sessions = computed<SessionListItem[]>(() =>
    sessionData.value
      .map((session) => ({
        id: session.id,
        data: session,
        isCurrent: session.id === user.value.session.id,
        isStale: Date.now() - session.updatedAt.getTime() > STALE_SESSION_THRESHOLD_MS,
      }))
      .sort((first, second) => Number(second.isCurrent) - Number(first.isCurrent)),
  )

  async function loadSessions(): Promise<void> {
    isLoading.value = true
    loadError.value = null

    try {
      const [accessToken, csrfToken] = await Promise.all([
        authStore.getValidAccessToken(),
        authStore.getValidCsrfToken(),
      ])

      sessionData.value = await api.sessions.list(accessToken, csrfToken)
    } catch (error) {
      loadError.value = getErrorMessage(error)
    } finally {
      isLoading.value = false
    }
  }

  function revokeSession(session: SessionListItem): void {
    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: `modal-revoke-session-${session.id}`,
      props: {
        title: t('settings.sessions.revoke.title'),
        submit: t('common.revoke'),
        tone: 'danger',
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async () => {
          revokingSessionId.value = session.id

          try {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            await api.sessions.revoke(accessToken, csrfToken, session.id)
            sessionData.value = sessionData.value.filter(({ id }) => id !== session.id)
            modalStore.close()

            if (session.isCurrent) {
              authStore.purgeStore()
            } else {
              toastStore.addToast({
                message: t('settings.sessions.revoke.success'),
                tone: 'success',
              })
            }
          } finally {
            revokingSessionId.value = null
          }
        }),
      },
    })
  }

  function revokeAllSessions(): void {
    modalStore.open({
      view: ConfirmAction,
      size: 'sm',
      key: 'modal-revoke-all-sessions',
      props: {
        title: t('settings.sessions.revokeAll.title'),
        submit: t('settings.sessions.revokeAll.action'),
        tone: 'danger',
        callbackCancel: modalStore.close,
        callbackSubmit: handleModalSubmit(async () => {
          isRevokingAll.value = true

          try {
            const [accessToken, csrfToken] = await Promise.all([
              authStore.getValidAccessToken(),
              authStore.getValidCsrfToken(),
            ])

            await api.sessions.revokeAll(accessToken, csrfToken)
            modalStore.close()
            authStore.purgeStore()
          } finally {
            isRevokingAll.value = false
          }
        }),
      },
    })
  }

  onMounted(loadSessions)

  return {
    sessions,
    isLoading,
    loadError,
    revokingSessionId,
    isRevokingAll,
    loadSessions,
    revokeSession,
    revokeAllSessions,
  }
}
