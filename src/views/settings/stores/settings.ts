import { defineStore, type Store, type StoreDefinition } from 'pinia'

import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI.ts'
import type { SessionDto } from '@/library/models/user.ts'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'
import { useAuthStore } from '@/shared/stores/auth.ts'
import type { AuditDto, AccountActivityQuery } from '@/library/models/audit'
import type { PaginationMeta } from '@/library/models/pagination'

export interface SettingsState {
  $activity: AuditDto[]
  $activityPagination: PaginationMeta
  $activityLoading: boolean
  $activityError: string | null
  $activityRequestId: string
  $sessions: SessionDto[]
  $sessionsError: string | null
  $sessionsInitialized: boolean
  $sessionsLoading: boolean
  $sessionsUserId: string | null
  $sessionsRequestId: string
}

interface SettingsGetters {
  activity: (state: SettingsState) => AuditDto[]
  activityPagination: (state: SettingsState) => PaginationMeta
  isLoadingActivity: (state: SettingsState) => boolean
  activityError: (state: SettingsState) => string | null
  sessions: (state: SettingsState) => SessionDto[]
  sessionsError: (state: SettingsState) => string | null
  areSessionsInitialized: (state: SettingsState) => boolean
  isLoadingSessions: (state: SettingsState) => boolean
}

interface SettingsActions {
  loadActivity: (query?: AccountActivityQuery) => Promise<void>
  clearActivity: () => void
  clearSessions: () => void
  loadSessions: (force?: boolean) => Promise<void>
  removeSession: (sessionId: string) => void
  reset: () => void
}

function defaultActivityPagination(): PaginationMeta {
  return {
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  }
}

function createDefaultState(): SettingsState {
  return {
    $activity: [],
    $activityPagination: defaultActivityPagination(),
    $activityLoading: false,
    $activityError: null,
    $activityRequestId: crypto.randomUUID(),
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
    activity: (state: SettingsState): AuditDto[] => state.$activity,
    activityPagination: (state: SettingsState): PaginationMeta => state.$activityPagination,
    isLoadingActivity: (state: SettingsState): boolean => state.$activityLoading,
    activityError: (state: SettingsState): string | null => state.$activityError,
    sessions: (state: SettingsState): SessionDto[] => state.$sessions,
    sessionsError: (state: SettingsState): string | null => state.$sessionsError,
    areSessionsInitialized: (state: SettingsState): boolean => state.$sessionsInitialized,
    isLoadingSessions: (state: SettingsState): boolean => state.$sessionsLoading,
  },
  actions: {
    async loadActivity(query: AccountActivityQuery = {}): Promise<void> {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.reset()
        return
      }
      const requestId = crypto.randomUUID()
      this.$activityRequestId = requestId
      this.$activityLoading = true
      this.$activityError = null
      try {
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])
        if (requestId !== this.$activityRequestId) return
        const result = await useLocalHostAPI().account.activity(accessToken, csrfToken, query)
        if (requestId !== this.$activityRequestId) return
        this.$activity = result.data
        this.$activityPagination = result.meta
      } catch (error) {
        if (requestId !== this.$activityRequestId) return
        this.$activity = []
        this.$activityPagination = defaultActivityPagination()
        this.$activityError = useErrorMessage().getErrorMessage(error)
      } finally {
        if (requestId === this.$activityRequestId) this.$activityLoading = false
      }
    },

    clearActivity(): void {
      this.$activityRequestId = crypto.randomUUID()
      this.$activity = []
      this.$activityPagination = defaultActivityPagination()
      this.$activityLoading = false
      this.$activityError = null
    },

    clearSessions(): void {
      this.$sessionsRequestId = crypto.randomUUID()
      this.$sessions = []
      this.$sessionsError = null
      this.$sessionsInitialized = false
      this.$sessionsLoading = false
      this.$sessionsUserId = null
    },

    async loadSessions(): Promise<void> {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.reset()
        return
      }

      const userId = authStore.user?.id ?? null

      const requestId = crypto.randomUUID()
      this.$sessionsRequestId = requestId
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

        this.clearSessions()
        this.$sessionsError = message
      } finally {
        if (requestId === this.$sessionsRequestId) this.$sessionsLoading = false
      }
    },

    removeSession(sessionId: string): void {
      this.$sessions = this.$sessions.filter((session) => session.id !== sessionId)
    },

    reset(): void {
      this.clearSessions()
      this.clearActivity()
    },
  },
})

export type SettingsStore = Store<'settings', SettingsState, SettingsGetters, SettingsActions>
