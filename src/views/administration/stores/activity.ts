import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'

import { AuditPermissions } from '@/config/permissions'
import type { AuditDto, AuditActorType, AuditSort } from '@/library/models/audit'
import type { PaginationMeta } from '@/library/models/pagination'
import type { AdministrationAuditQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { createSessionScope } from '@/shared/helpers/session-scope'
import { useAuthStore } from '@/shared/stores/auth'
import type { PaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import {
  normalizePaginatedQuery,
  type PaginatedQueryDefaults,
} from '@/shared/hooks/usePaginatedQuery'
import type { LocationQuery } from 'vue-router'

export type AuditDetailError = 'unavailable' | 'forbidden' | 'unauthorized' | 'failed'

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
    take: Math.min(query.take, 100),
    ...(['occurredAt', 'createdAt', 'domain', 'event', 'actorType'].includes(query.sort ?? '')
      ? { sort: query.sort as AuditSort }
      : {}),
    ...(query.order ? { order: query.order } : {}),
    ...(query.domain ? { domain: query.domain } : {}),
    ...(query.event ? { event: query.event } : {}),
    ...(['user', 'anonymous', 'service', 'admin', 'system'].includes(query.actorType ?? '')
      ? { actorType: query.actorType as AuditActorType }
      : {}),
    ...(query.actorId || query.search ? { actorId: query.actorId ?? query.search } : {}),
    ...(query.occurredFrom ? { occurredFrom: query.occurredFrom } : {}),
    ...(query.occurredTo ? { occurredTo: query.occurredTo } : {}),
  }
}

export const ADMINISTRATION_ACTIVITY_DEFAULT_TAKE = 10

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: ADMINISTRATION_ACTIVITY_DEFAULT_TAKE,
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
    requestId: crypto.randomUUID(),
    error: null as string | null,
    detail: null as AuditDto | null,
    detailError: null as AuditDetailError | null,
    detailOwner: null as string | null,
    detailRequestId: crypto.randomUUID(),
  }),
  actions: {
    clearDetail(owner?: string): void {
      if (owner !== undefined && this.detailOwner !== owner) return
      this.detailRequestId = crypto.randomUUID()
      this.detailOwner = null
      this.detail = null
      this.detailError = null
    },
    async loadDetail(auditId: string, owner: string): Promise<void> {
      this.clearDetail()
      this.detailOwner = owner
      const requestId = this.detailRequestId
      const auth = useAuthStore()
      const session = createSessionScope(auth)

      if (!session.isCurrent()) {
        this.detailError = 'unauthorized'

        return
      }

      if (!auth.canActivate([AuditPermissions.READ_AUDIT_DETAIL])) {
        this.detailError = 'forbidden'

        return
      }

      const isCurrent = () => requestId === this.detailRequestId
      const stillAuthorized = () =>
        session.isCurrent() && auth.canActivate([AuditPermissions.READ_AUDIT_DETAIL])

      try {
        const token = await auth.getValidAccessToken()

        if (!isCurrent()) return
        if (!stillAuthorized()) {
          this.clearDetail(owner)

          return
        }

        const record = await useLocalHostAPI().administration.audits.detail(token, auditId)

        if (!isCurrent()) return
        if (!stillAuthorized()) {
          this.clearDetail(owner)

          return
        }

        this.detail = record
      } catch (cause) {
        if (!isCurrent()) return
        if (!stillAuthorized()) {
          this.clearDetail(owner)

          return
        }

        const status = isAxiosError(cause) ? cause.response?.status : undefined

        this.detailError =
          status === 404
            ? 'unavailable'
            : status === 403
              ? 'forbidden'
              : status === 401
                ? 'unauthorized'
                : 'failed'
      }
    },
    clear(): void {
      this.clearDetail()
      this.requestId = crypto.randomUUID()
      this.activity = []
      this.pagination = defaultPagination()
      this.loading = false
      this.error = null
    },
    async loadActivity(query: AdministrationAuditQuery = {}): Promise<void> {
      const authStore = useAuthStore()
      const session = createSessionScope(authStore)

      if (!session.isCurrent() || !authStore.canActivate([AuditPermissions.SEARCH_AUDIT])) {
        this.clear()

        return
      }

      const requestId = crypto.randomUUID()
      const stillAuthorized = () =>
        session.isCurrent() && authStore.canActivate([AuditPermissions.SEARCH_AUDIT])

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

        const result = await useLocalHostAPI().administration.audits.search(token, query)

        if (requestId !== this.requestId) return
        if (!stillAuthorized()) {
          this.clear()

          return
        }

        this.activity = result.data
        this.pagination = result.meta
      } catch (error) {
        if (requestId !== this.requestId) return
        if (!stillAuthorized()) {
          this.clear()

          return
        }

        this.activity = []
        this.pagination = defaultPagination()
        this.error = error instanceof Error ? error.message : 'Unable to load platform activity.'
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
  },
})
