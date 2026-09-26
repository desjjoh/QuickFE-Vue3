import { defineStore } from 'pinia'

import type { AuditDto } from '@/library/models/audit'
import type { PaginationMeta } from '@/library/models/pagination'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore } from '@/shared/stores/auth'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'

const PROFILE_ACTIVITY_LIMIT = 5

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
    accountHomeActivity: [] as AuditDto[],
    recentActivity: [] as AuditDto[],
    pagination: defaultPagination(),
    loading: false,
  }),
  actions: {
    async loadAccountHomeActivity(): Promise<void> {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.$reset()
        return
      }

      try {
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])
        const response = await useLocalHostAPI().account.activity(accessToken, csrfToken, {
          take: PROFILE_ACTIVITY_LIMIT,
        })

        this.accountHomeActivity = response.data
      } catch {
        this.accountHomeActivity = []
      }
    },

    async loadRecentActivity(query: AccountActivityQuery = {}): Promise<void> {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.$reset()
        return
      }

      this.loading = true

      try {
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])
        const response = await useLocalHostAPI().account.activity(accessToken, csrfToken, query)

        this.recentActivity = response.data
        this.pagination = response.meta
      } catch {
        this.recentActivity = []
        this.pagination = defaultPagination()
      } finally {
        this.loading = false
      }
    },
  },
})
