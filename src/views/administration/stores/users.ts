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
  }),
  actions: {
    async loadUsers(query: AdministrationUsersQuery = {}): Promise<void> {
      const authStore = useAuthStore()

      if (
        !authStore.isAuthenticated ||
        !authStore.canActivate([UserAdministrationPermissions.READ_USERS])
      ) {
        this.$reset()
        return
      }

      this.loading = true

      try {
        const token = await authStore.getValidAccessToken()
        const result = await useLocalHostAPI().administration.users.getUsers(token, query)

        this.users = result.data
        this.pagination = result.meta
      } catch {
        this.$reset()
      } finally {
        this.loading = false
      }
    },
  },
})
