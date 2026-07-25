import { defineStore, type Store, type StoreDefinition } from 'pinia'

import { useLocalHostAPI } from '@/api/useLocalhostAPI.ts'
import type { SessionDto } from '@/library/models/user.ts'
import { useAuthStore } from '@/stores/auth.ts'

export interface SettingsState {
  $sessions: SessionDto[]
  $sessionsUserId: string | null
}

interface SettingsGetters {
  sessions: (state: SettingsState) => SessionDto[]
}

interface SettingsActions {
  loadSessions: (force?: boolean) => Promise<void>
  removeSession: (sessionId: string) => void
  reset: () => void
}

function createDefaultState(): SettingsState {
  return {
    $sessions: [],
    $sessionsUserId: null,
  }
}

type StoreDef = StoreDefinition<'settings', SettingsState, SettingsGetters, SettingsActions>

let sessionsRequest: Promise<void> | null = null

export const useSettingsStore: StoreDef = defineStore('settings', {
  state: (): SettingsState => createDefaultState(),
  getters: {
    sessions: (state: SettingsState): SessionDto[] => state.$sessions,
  },
  actions: {
    async loadSessions(): Promise<void> {
      const authStore = useAuthStore()
      const userId = authStore.user?.id ?? null

      sessionsRequest = (async () => {
        const api = useLocalHostAPI()
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])

        this.$sessions = await api.sessions.list(accessToken, csrfToken)
        this.$sessionsUserId = userId

        sessionsRequest = null
      })()

      return sessionsRequest
    },

    removeSession(sessionId: string): void {
      this.$sessions = this.$sessions.filter((session) => session.id !== sessionId)
    },

    reset(): void {
      this.$state = createDefaultState()
      sessionsRequest = null
    },
  },
})

export type SettingsStore = Store<'settings', SettingsState, SettingsGetters, SettingsActions>
