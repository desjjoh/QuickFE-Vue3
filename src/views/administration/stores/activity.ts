import { defineStore } from 'pinia'

import { AuditPermissions } from '@/config/permissions'
import type { AuditDto } from '@/library/models/audit'
import type { PaginationMeta } from '@/library/models/pagination'
import type { AdministrationAuditQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore } from '@/shared/stores/auth'
import type { PaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import {
  normalizePaginatedQuery,
  type PaginatedQueryDefaults,
} from '@/shared/hooks/usePaginatedQuery'
import type { LocationQuery } from 'vue-router'

export interface AdministrationActivityQuery extends PaginatedQuery {
  domain?: string
  event?: string
  actorType?: string
  actorId?: string
  occurredFrom?: string
  occurredTo?: string
}

function normalizedValue(query: LocationQuery, key: string): string | undefined {
  const value = query[key]
  const first = Array.isArray(value) ? value[0] : value
  return first?.trim() || undefined
}

export function normalizeAdministrationActivityQuery(
  query: LocationQuery,
  defaults: PaginatedQueryDefaults,
): AdministrationActivityQuery {
  const pagination = normalizePaginatedQuery(query, defaults)
  const filterKeys = [
    'domain',
    'event',
    'actorType',
    'actorId',
    'occurredFrom',
    'occurredTo',
  ] as const

  return filterKeys.reduce<AdministrationActivityQuery>((normalized, key) => {
    const value = normalizedValue(query, key)
    return value ? { ...normalized, [key]: value } : normalized
  }, pagination)
}

/** Restricts UI/URL state to the fields accepted by the audit endpoint. */
export function toAdministrationAuditQuery(
  query: AdministrationActivityQuery,
): AdministrationAuditQuery {
  return {
    page: query.page,
    take: query.take,
    ...(query.domain ? { domain: query.domain } : {}),
    ...(query.event ? { event: query.event } : {}),
    ...(query.actorType ? { actorType: query.actorType } : {}),
    ...(query.actorId || query.search ? { actorId: query.actorId ?? query.search } : {}),
    ...(query.occurredFrom ? { occurredFrom: query.occurredFrom } : {}),
    ...(query.occurredTo ? { occurredTo: query.occurredTo } : {}),
  }
}

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: 25,
  itemCount: 0,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
})

export const useAdministrationActivityStore = defineStore('administration-activity', {
  state: () => ({
    activity: [] as AuditDto[],
    pagination: defaultPagination(),
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async loadActivity(query: AdministrationAuditQuery = {}): Promise<void> {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated || !authStore.canActivate([AuditPermissions.SEARCH_AUDIT])) {
        this.$reset()
        return
      }

      this.loading = true
      this.error = null
      try {
        const token = await authStore.getValidAccessToken()
        const result = await useLocalHostAPI().administration.audits.search(token, query)
        this.activity = result.data
        this.pagination = result.meta
      } catch (error) {
        this.activity = []
        this.pagination = defaultPagination()
        this.error = error instanceof Error ? error.message : 'Unable to load platform activity.'
      } finally {
        this.loading = false
      }
    },
  },
})
