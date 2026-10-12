import { defineStore, type Store, type StoreDefinition } from 'pinia'

import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI.ts'
import type { SessionDto } from '@/library/models/user.ts'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'
import { useAuthStore } from '@/shared/stores/auth.ts'

export interface SettingsState {
  $sessions: SessionDto[]
  $sessionsError: string | null
  $sessionsInitialized: boolean
  $sessionsLoading: boolean
  $sessionsUserId: string | null
  $sessionsRequestId: number
}

interface SettingsGetters {
  sessions: (state: SettingsState) => SessionDto[]
  sessionsError: (state: SettingsState) => string | null
  areSessionsInitialized: (state: SettingsState) => boolean
  isLoadingSessions: (state: SettingsState) => boolean
}

interface SettingsActions {
  loadSessions: (force?: boolean) => Promise<void>
  removeSession: (sessionId: string) => void
  reset: () => void
}

function createDefaultState(): SettingsState {
  return {
    $sessions: [],
    $sessionsError: null,
    $sessionsInitialized: false,
    $sessionsLoading: false,
    $sessionsUserId: null,
    $sessionsRequestId: 0,
  }
}

type StoreDef = StoreDefinition<'settings', SettingsState, SettingsGetters, SettingsActions>

export const useSettingsStore: StoreDef = defineStore('settings', {
  state: (): SettingsState => createDefaultState(),
  getters: {
    sessions: (state: SettingsState): SessionDto[] => state.$sessions,
    sessionsError: (state: SettingsState): string | null => state.$sessionsError,
    areSessionsInitialized: (state: SettingsState): boolean => state.$sessionsInitialized,
    isLoadingSessions: (state: SettingsState): boolean => state.$sessionsLoading,
  },
  actions: {
    async loadSessions(): Promise<void> {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.reset()
        return
      }

      const userId = authStore.user?.id ?? null

      const requestId = ++this.$sessionsRequestId
      this.$sessionsLoading = true
      this.$sessionsError = null

      try {
        const api = useLocalHostAPI()
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])

        if (requestId !== this.$sessionsRequestId) return
        const sessions = await api.sessions.list(accessToken, csrfToken)
        if (requestId !== this.$sessionsRequestId) return
        this.$sessions = sessions
        this.$sessionsUserId = userId
        this.$sessionsInitialized = true
      } catch (error) {
        if (requestId !== this.$sessionsRequestId) return
        const message = useErrorMessage().getErrorMessage(error)

        this.$state = { ...createDefaultState(), $sessionsRequestId: requestId }
        this.$sessionsError = message
      } finally {
        if (requestId === this.$sessionsRequestId) this.$sessionsLoading = false
      }
    },

    removeSession(sessionId: string): void {
      this.$sessions = this.$sessions.filter((session) => session.id !== sessionId)
    },

    reset(): void {
      const requestId = this.$sessionsRequestId + 1
      this.$state = { ...createDefaultState(), $sessionsRequestId: requestId }
    },
  },
})

export type SettingsStore = Store<'settings', SettingsState, SettingsGetters, SettingsActions>
