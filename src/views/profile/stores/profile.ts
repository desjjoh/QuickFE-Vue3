import { defineStore } from 'pinia'

import type { AuditDto } from '@/library/models/audit'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore } from '@/shared/stores/auth'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    feedActivity: [] as AuditDto[],
    loading: false,
    requestId: 0,
  }),
  actions: {
    clearActivity(): void {
      this.requestId += 1
      this.feedActivity = []
      this.loading = false
    },

    async loadActivity(query: AccountActivityQuery = {}): Promise<void> {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.clearActivity()
        return
      }

      const requestId = ++this.requestId
      this.loading = true

      try {
        const [accessToken, csrfToken] = await Promise.all([
          authStore.getValidAccessToken(),
          authStore.getValidCsrfToken(),
        ])
        if (requestId !== this.requestId) return
        const response = await useLocalHostAPI().account.activity(accessToken, csrfToken, query)

        if (requestId !== this.requestId) return
        this.feedActivity = response.data
      } catch {
        if (requestId !== this.requestId) return
        this.feedActivity = []
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
  },
})
