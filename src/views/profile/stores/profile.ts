import { defineStore } from 'pinia'

import type { AuditDto } from '@/library/models/audit'
import type { PaginationMeta } from '@/library/models/pagination'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore } from '@/shared/stores/auth'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'

export type ProfileActivityTarget = 'feedActivity' | 'tableActivity'

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: 25,
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
    requestIds: { feedActivity: 0, tableActivity: 0 },
  }),
  actions: {
    clearActivity(target: ProfileActivityTarget): void {
      this.requestIds[target] += 1
      this[target] = []
      this.loading[target] = false
      if (target === 'tableActivity') this.pagination = defaultPagination()
    },

    async loadActivity(
      target: ProfileActivityTarget,
      query: AccountActivityQuery = {},
    ): Promise<void> {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.clearActivity('feedActivity')
        this.clearActivity('tableActivity')
        return
      }

      const requestId = ++this.requestIds[target]
      this.loading[target] = true

      try {
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])
        if (requestId !== this.requestIds[target]) return
        const response = await useLocalHostAPI().account.activity(accessToken, csrfToken, query)

        if (requestId !== this.requestIds[target]) return
        this[target] = response.data
        if (target === 'tableActivity') this.pagination = response.meta
      } catch {
        if (requestId !== this.requestIds[target]) return
        this[target] = []
        if (target === 'tableActivity') this.pagination = defaultPagination()
      } finally {
        if (requestId === this.requestIds[target]) this.loading[target] = false
      }
    },
  },
})
