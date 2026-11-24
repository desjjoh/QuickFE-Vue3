import type { LocationQuery } from 'vue-router'
import { toAccountActivityQuery } from '@/shared/helpers/api-queries'
import { normalizePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { PROFILE_ACTIVITY_DEFAULT_TAKE } from '../stores/profile'

export const profileActivityFilterKeys = ['event', 'occurredFrom', 'occurredTo'] as const

export function profileActivityFilters(query: LocationQuery): LocationQuery {
  const { event, occurredFrom, occurredTo } = query

  return {
    event: event ?? null,
    occurredFrom: occurredFrom ?? null,
    occurredTo: occurredTo ?? null,
  }
}

function filterValue(value: LocationQuery[string] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value

  return first?.trim() || undefined
}

export function profileActivityQuery(query: LocationQuery) {
  return toAccountActivityQuery({
    ...normalizePaginatedQuery(query, { page: 1, take: PROFILE_ACTIVITY_DEFAULT_TAKE }),
    event: filterValue(query.event),
    occurredFrom: filterValue(query.occurredFrom),
    occurredTo: filterValue(query.occurredTo),
  })
}
