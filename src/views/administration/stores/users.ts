import { defineStore } from 'pinia'

import type { PaginationMeta } from '@/library/models/pagination'
import type { UserAdministrationDto } from '@/library/models/administration'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import type { AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { useAuthStore } from '@/shared/stores/auth'
import { UserAdministrationPermissions } from '@/config/permissions'

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: 10,
  itemCount: 0,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
})

export const useAdministrationUsersStore = defineStore('administration-users', {
  state: () => ({
    users: [] as UserAdministrationDto[],
    pagination: defaultPagination(),
    loading: false,
    requestId: 0,
  }),
  actions: {
    clear(): void {
      this.requestId += 1
      this.users = []
      this.pagination = defaultPagination()
      this.loading = false
    },
    async loadUsers(query: AdministrationUsersQuery = {}): Promise<void> {
      const authStore = useAuthStore()

      if (
        !authStore.isAuthenticated ||
        !authStore.canActivate([UserAdministrationPermissions.READ_USERS])
      ) {
        this.clear()
        return
      }

      const requestId = ++this.requestId
      this.loading = true

      try {
        const token = await authStore.getValidAccessToken()
        if (requestId !== this.requestId) return
        const result = await useLocalHostAPI().administration.users.getUsers(token, query)

        if (requestId !== this.requestId) return
        this.users = result.data
        this.pagination = result.meta
      } catch {
        if (requestId !== this.requestId) return
        this.clear()
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
  },
})
