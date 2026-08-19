import { defineStore } from 'pinia'

import type { PaginationMeta } from '@/library/models/pagination'
import type { UserDto } from '@/library/models/user'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import type { AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { useAuthStore } from '@/shared/stores/auth'

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: 25,
  itemCount: 0,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
})

export const useAdministrationUsersStore = defineStore('administration-users', {
  state: () => ({
    users: [] as UserDto[],
    pagination: defaultPagination(),
    loading: false,
  }),
  actions: {
    async loadUsers(query: AdministrationUsersQuery = {}): Promise<void> {
      this.loading = true

      try {
        const token = await useAuthStore().getValidAccessToken()
        const result = await useLocalHostAPI().administration.users.getUsers(token, query)

        this.users = result.data
        this.pagination = result.meta
      } finally {
        this.loading = false
      }
    },
  },
})
