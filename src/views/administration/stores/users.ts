import { defineStore } from 'pinia'

import type { PaginationMeta } from '@/library/models/pagination'
import type { UserAdministrationDto } from '@/library/models/administration'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import type { AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { loadAuthorizedRead } from '@/shared/helpers/load-authorized-read'
import { UserAdministrationPermissions } from '@/config/permissions'

export const ADMINISTRATION_USERS_DEFAULT_TAKE = 10

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: ADMINISTRATION_USERS_DEFAULT_TAKE,
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
    error: null as string | null,
    requestId: crypto.randomUUID(),
  }),
  actions: {
    clear(): void {
      this.requestId = crypto.randomUUID()
      this.users = []
      this.pagination = defaultPagination()
      this.loading = false
      this.error = null
    },
    loadUsers(query: AdministrationUsersQuery = {}): Promise<void> {
      return loadAuthorizedRead(this, {
        permissions: [UserAdministrationPermissions.READ_USERS],
        load: (token) => useLocalHostAPI().administration.users.getUsers(token, query),
        clear: () => this.clear(),
        onSuccess: (result) => {
          this.users = result.data
          this.pagination = result.meta
        },
        onError: (cause) => {
          this.clear()
          this.error = cause instanceof Error ? cause.message : 'Unable to load users.'
        },
      })
    },
  },
})
