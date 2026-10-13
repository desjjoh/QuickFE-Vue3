import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  normalizeAdministrationActivityQuery,
  ADMINISTRATION_ACTIVITY_DEFAULT_TAKE,
} from '../stores/activity'
import { getUpdatedRouteQuery } from '@/shared/hooks/usePaginatedQuery'

export const activityFilterKeys = [
  'domain',
  'event',
  'actorType',
  'actorId',
  'occurredFrom',
  'occurredTo',
] as const
export const auditActorTypes = ['user', 'anonymous', 'service', 'admin', 'system'] as const
export type ActivityFilterDraft = Record<(typeof activityFilterKeys)[number], string>
export type ActivityFilterError = 'invalidDate' | 'dateRange' | 'invalidActor' | 'tooLong'

function localDate(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function dateBoundary(value: string, endOfDay = false): Date {
  return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`)
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = dateBoundary(value)
  return Number.isFinite(date.getTime()) && localDate(date.toISOString()) === value
}

export function activityFilterDraft(query: LocationQuery): ActivityFilterDraft {
  const filters = normalizeAdministrationActivityQuery(query, {
    page: 1,
    take: ADMINISTRATION_ACTIVITY_DEFAULT_TAKE,
  })
  return {
    domain: filters.domain ?? '',
    event: filters.event ?? '',
    actorType: filters.actorType ?? '',
    actorId: filters.actorId ?? filters.search ?? '',
    occurredFrom: localDate(filters.occurredFrom),
    occurredTo: localDate(filters.occurredTo),
  }
}

export function validateActivityFilters(draft: ActivityFilterDraft): ActivityFilterError | null {
  if (
    draft.domain.trim().length > 64 ||
    draft.event.trim().length > 128 ||
    draft.actorId.trim().length > 255
  )
    return 'tooLong'
  if (draft.actorType && !(auditActorTypes as readonly string[]).includes(draft.actorType))
    return 'invalidActor'
  for (const key of ['occurredFrom', 'occurredTo'] as const) {
    if (draft[key] && !validDate(draft[key])) return 'invalidDate'
  }
  if (draft.occurredFrom && draft.occurredTo && draft.occurredFrom > draft.occurredTo)
    return 'dateRange'
  return null
}

/** Replace filters together, preserving sort, page size and unrelated URL state. */
export function activityFilterQuery(
  current: LocationQuery,
  draft?: ActivityFilterDraft,
): LocationQueryRaw {
  const next = getUpdatedRouteQuery(current, {}, true, 1, ADMINISTRATION_ACTIVITY_DEFAULT_TAKE)
  for (const key of [...activityFilterKeys, 'search']) delete next[key]
  if (!draft) return next
  for (const key of activityFilterKeys) {
    const value = draft[key].trim()
    if (value)
      next[key] =
        key === 'occurredFrom' || key === 'occurredTo'
          ? dateBoundary(value, key === 'occurredTo').toISOString()
          : value
  }
  return next
}
