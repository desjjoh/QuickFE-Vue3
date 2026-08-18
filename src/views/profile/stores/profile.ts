import { defineStore } from 'pinia'

import type { AuditDto } from '@/library/models/audit'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore } from '@/shared/stores/auth'

const PROFILE_ACTIVITY_LIMIT = 5

export const useProfileStore = defineStore('profile', {
  state: () => ({
    activity: [] as AuditDto[],
  }),
  actions: {
    async loadActivity(): Promise<void> {
      const authStore = useAuthStore()

      const [accessToken, csrfToken] = await Promise.all([
        authStore.getValidAccessToken(),
        authStore.getValidCsrfToken(),
      ])
      const response = await useLocalHostAPI().account.activity(accessToken, csrfToken, {
        take: PROFILE_ACTIVITY_LIMIT,
      })

      this.activity = response.data
    },
  },
})
