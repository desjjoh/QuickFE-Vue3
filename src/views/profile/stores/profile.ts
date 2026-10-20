import { defineStore } from 'pinia'

import type { AuditDto } from '@/library/models/audit'
import type { PaginationMeta } from '@/library/models/pagination'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage'
import { createSessionScope } from '@/shared/helpers/session-scope'
import { useAuthStore } from '@/shared/stores/auth'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'

export type ProfileActivityTarget = 'feedActivity' | 'tableActivity'

export const PROFILE_ACTIVITY_DEFAULT_TAKE = 10

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: PROFILE_ACTIVITY_DEFAULT_TAKE,
  itemCount: 0,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
})

export const useProfileStore = defineStore('profile', {
  state: () => ({
    feedActivity: [] as AuditDto[],
    tableActivity: [] as AuditDto[],
    pagination: defaultPagination(),
    loading: { feedActivity: false, tableActivity: false },
    errors: { feedActivity: null as string | null, tableActivity: null as string | null },
    requestIds: { feedActivity: crypto.randomUUID(), tableActivity: crypto.randomUUID() },
  }),
  actions: {
    clearActivity(target: ProfileActivityTarget): void {
      this.requestIds[target] = crypto.randomUUID()
      this[target] = []
      this.loading[target] = false
      this.errors[target] = null
      if (target === 'tableActivity') this.pagination = defaultPagination()
    },

    async loadActivity(
      target: ProfileActivityTarget,
      query: AccountActivityQuery = {},
    ): Promise<void> {
      const authStore = useAuthStore()
      const session = createSessionScope(authStore)

      if (!session.isCurrent()) {
        this.clearActivity('feedActivity')
        this.clearActivity('tableActivity')
        return
      }

      const requestId = crypto.randomUUID()
      this.requestIds[target] = requestId
      this.errors[target] = null
      this.loading[target] = true

      try {
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])
        if (requestId !== this.requestIds[target]) return
        if (!session.isCurrent()) {
          this.clearActivity(target)
          return
        }
        const response = await useLocalHostAPI().account.activity(accessToken, csrfToken, query)

        if (requestId !== this.requestIds[target]) return
        if (!session.isCurrent()) {
          this.clearActivity(target)
          return
        }
        this[target] = response.data
        if (target === 'tableActivity') this.pagination = response.meta
      } catch (error) {
        if (requestId !== this.requestIds[target]) return
        if (!session.isCurrent()) {
          this.clearActivity(target)
          return
        }
        this[target] = []
        this.errors[target] = useErrorMessage().getErrorMessage(error)
        if (target === 'tableActivity') this.pagination = defaultPagination()
      } finally {
        if (requestId === this.requestIds[target]) this.loading[target] = false
      }
    },
  },
})
