import { defineStore, type Store, type StoreDefinition } from 'pinia'

import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI.ts'
import type { SessionDto } from '@/library/models/user.ts'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'
import { runAuthenticatedRead } from '@/shared/helpers/load-authorized-read'
import { useAuthStore } from '@/shared/stores/auth.ts'

export interface SettingsState {
  $sessions: SessionDto[]
  $sessionsError: string | null
  $sessionsInitialized: boolean
  $sessionsLoading: boolean
  $sessionsUserId: string | null
  $sessionsRequestId: string
}

interface SettingsGetters {
  sessions: (state: SettingsState) => SessionDto[]
  sessionsError: (state: SettingsState) => string | null
  areSessionsInitialized: (state: SettingsState) => boolean
  isLoadingSessions: (state: SettingsState) => boolean
}

interface SettingsActions {
  clearSessions: () => void
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
    $sessionsRequestId: crypto.randomUUID(),
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
    clearSessions(): void {
      this.$sessionsRequestId = crypto.randomUUID()
      this.$sessions = []
      this.$sessionsError = null
      this.$sessionsInitialized = false
      this.$sessionsLoading = false
      this.$sessionsUserId = null
    },

    loadSessions(): Promise<void> {
      const userId = useAuthStore().user?.id ?? null

      return runAuthenticatedRead({
        getCredentials: (auth) =>
          Promise.all([auth.getValidAccessToken(), auth.getValidCsrfToken()]),
        load: ([accessToken, csrfToken]) =>
          useLocalHostAPI().account.sessions.list(accessToken, csrfToken),
        start: () => {
          const requestId = crypto.randomUUID()

          this.$sessionsRequestId = requestId
          this.$sessionsLoading = true
          this.$sessionsError = null

          return () => this.$sessionsRequestId === requestId
        },
        onAccessDenied: () => this.reset(),
        onAccessLost: () => this.clearSessions(),
        onSuccess: (sessions) => {
          this.$sessions = sessions
          this.$sessionsUserId = userId
          this.$sessionsInitialized = true
        },
        onError: (error) => {
          const message = useErrorMessage().getErrorMessage(error)

          this.clearSessions()
          this.$sessionsError = message
        },
        onFinish: () => {
          this.$sessionsLoading = false
        },
      })
    },

    removeSession(sessionId: string): void {
      this.$sessions = this.$sessions.filter((session) => session.id !== sessionId)
    },

    reset(): void {
      this.clearSessions()
    },
  },
})

export type SettingsStore = Store<'settings', SettingsState, SettingsGetters, SettingsActions>
