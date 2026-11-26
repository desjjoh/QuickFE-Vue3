import { defineStore } from 'pinia'

import type { AuditDto } from '@/library/models/audit'
import type { PaginationMeta } from '@/library/models/pagination'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage'
import { runAuthenticatedRead } from '@/shared/helpers/load-authorized-read'
import { clearDetailRead, loadDetailRead, type DetailReadError } from '@/shared/helpers/detail-read'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'

export type ProfileActivityTarget = 'feedActivity' | 'tableActivity'

export const PROFILE_ACTIVITY_DEFAULT_TAKE = 10

const defaultPagination = (): PaginationMeta => ({
  page: 1,
  take: PROFILE_ACTIVITY_DEFAULT_TAKE,
  itemCount: 0,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
})

export const useProfileStore = defineStore('profile', {
  state: () => ({
    feedActivity: [] as AuditDto[],
    tableActivity: [] as AuditDto[],
    pagination: defaultPagination(),
    loading: { feedActivity: false, tableActivity: false },
    errors: { feedActivity: null as string | null, tableActivity: null as string | null },
    requestIds: { feedActivity: crypto.randomUUID(), tableActivity: crypto.randomUUID() },
    activityDetail: {
      detail: null as AuditDto | null,
      detailError: null as DetailReadError | null,
      detailOwner: null as string | null,
      detailRequestId: crypto.randomUUID(),
    },
  }),
  actions: {
    clearActivityDetail(owner?: string): void {
      clearDetailRead(this.activityDetail, owner)
    },

    loadActivityDetail(id: string, owner: string): Promise<void> {
      return loadDetailRead(this.activityDetail, owner, {
        getCredentials: (auth) =>
          Promise.all([auth.getValidAccessToken(), auth.getValidCsrfToken()]),
        load: ([accessToken, csrfToken]) =>
          useLocalHostAPI().account.activityDetail(accessToken, csrfToken, id),
      })
    },

    clearActivity(target: ProfileActivityTarget): void {
      this.requestIds[target] = crypto.randomUUID()
      this[target] = []
      this.loading[target] = false
      this.errors[target] = null
      if (target === 'tableActivity') this.pagination = defaultPagination()
    },

    loadActivity(target: ProfileActivityTarget, query: AccountActivityQuery = {}): Promise<void> {
      return runAuthenticatedRead({
        getCredentials: (auth) =>
          Promise.all([auth.getValidAccessToken(), auth.getValidCsrfToken()]),
        load: ([accessToken, csrfToken]) =>
          useLocalHostAPI().account.activity(accessToken, csrfToken, query),
        start: () => {
          const requestId = crypto.randomUUID()

          this.requestIds[target] = requestId
          this.errors[target] = null
          this.loading[target] = true

          return () => this.requestIds[target] === requestId
        },
        onAccessDenied: () => {
          this.clearActivity('feedActivity')
          this.clearActivity('tableActivity')
        },
        onAccessLost: () => this.clearActivity(target),
        onSuccess: (response) => {
          this[target] = response.data
          if (target === 'tableActivity') this.pagination = response.meta
        },
        onError: (error) => {
          this[target] = []
          this.errors[target] = useErrorMessage().getErrorMessage(error)
          if (target === 'tableActivity') this.pagination = defaultPagination()
        },
        onFinish: () => {
          this.loading[target] = false
        },
      })
    },
  },
})
