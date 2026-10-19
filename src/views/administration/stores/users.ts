import { defineStore } from 'pinia'

import type { PaginationMeta } from '@/library/models/pagination'
import type { UserAdministrationDto } from '@/library/models/administration'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import type { AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { useAuthStore } from '@/shared/stores/auth'
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
    async loadUsers(query: AdministrationUsersQuery = {}): Promise<void> {
      const authStore = useAuthStore()

      if (
        !authStore.isAuthenticated ||
        !authStore.canActivate([UserAdministrationPermissions.READ_USERS])
      ) {
        this.clear()
        return
      }

      const requestId = crypto.randomUUID()
      const userId = authStore.user?.id
      const stillAuthorized = () =>
        authStore.isAuthenticated &&
        authStore.user?.id === userId &&
        authStore.canActivate([UserAdministrationPermissions.READ_USERS])
      this.requestId = requestId
      this.loading = true
      this.error = null

      try {
        const token = await authStore.getValidAccessToken()
        if (requestId !== this.requestId) return
        if (!stillAuthorized()) {
          this.clear()
          return
        }
        const result = await useLocalHostAPI().administration.users.getUsers(token, query)

        if (requestId !== this.requestId) return
        if (!stillAuthorized()) {
          this.clear()
          return
        }
        this.users = result.data
        this.pagination = result.meta
      } catch (cause) {
        if (requestId !== this.requestId) return
        this.clear()
        this.error = cause instanceof Error ? cause.message : 'Unable to load users.'
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
  },
})
