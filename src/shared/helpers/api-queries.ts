import type { AccountActivityQuery, AuditSort } from '@/library/models/audit'
import type {
  AdministrationUsersQuery,
  AdministrationUserSort,
} from '@/library/models/administration'
import type { PaginatedQuery } from '@/shared/hooks/usePaginatedQuery'

export function toAdministrationUsersQuery(query: PaginatedQuery): AdministrationUsersQuery {
  const sorts: readonly string[] = [
    'user.createdAt',
    'profile.name.last',
    'user.identity.email',
    'fullname',
    'user.metadata.last_sign_in',
  ]
  return {
    page: query.page,
    take: Math.min(query.take, 100),
    search: query.search,
    order: query.order,
    ...(sorts.includes(query.sort ?? '') ? { sort: query.sort as AdministrationUserSort } : {}),
  }
}

export function toAccountActivityQuery(
  query: Omit<AccountActivityQuery, 'sort'> & { sort?: string },
): AccountActivityQuery {
  const sorts: readonly string[] = ['occurredAt', 'createdAt', 'domain', 'event', 'actorType']
  return {
    page: query.page,
    take: query.take === undefined ? undefined : Math.min(query.take, 100),
    order: query.order,
    domain: query.domain,
    event: query.event,
    occurredFrom: query.occurredFrom,
    occurredTo: query.occurredTo,
    ...(sorts.includes(query.sort ?? '') ? { sort: query.sort as AuditSort } : {}),
  }
}
