import { computed, watch, type Ref } from 'vue'
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from 'vue-router'

export type PaginatedQuery = {
  page: number
  take: number
  search?: string
  sort?: string
  order?: 'ASC' | 'DESC'
}

export type PaginatedQueryDefaults = Pick<PaginatedQuery, 'page' | 'take'>

export type PaginatedQueryUpdate = Partial<PaginatedQuery>

function firstValue(value: LocationQuery[string] | undefined): string | undefined {
  return Array.isArray(value) ? (value[0] ?? undefined) : (value ?? undefined)
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function normalizeQuery(query: LocationQuery, defaults: PaginatedQueryDefaults): PaginatedQuery {
  const search = firstValue(query.search)?.trim() || undefined
  const sort = firstValue(query.sort) || undefined
  const orderValue = firstValue(query.order)
  const order = sort && (orderValue === 'ASC' || orderValue === 'DESC') ? orderValue : undefined

  return {
    page: positiveInteger(firstValue(query.page), defaults.page),
    take: positiveInteger(firstValue(query.take), defaults.take),
    ...(search ? { search } : {}),
    ...(sort ? { sort } : {}),
    ...(order ? { order } : {}),
  }
}

export function getNextSortQuery(
  current: Pick<PaginatedQuery, 'sort' | 'order'>,
  sort: string,
): Pick<PaginatedQuery, 'sort' | 'order'> {
  if (current.sort !== sort) return { sort, order: 'ASC' }
  if (current.order === 'ASC') return { sort, order: 'DESC' }
  if (current.order === 'DESC') return { sort: undefined, order: undefined }

  return { sort, order: 'ASC' }
}

export function getUpdatedRouteQuery(
  current: LocationQuery,
  update: PaginatedQueryUpdate,
  resetPage = false,
): LocationQueryRaw {
  const next: LocationQueryRaw = { ...current }

  if (resetPage && !Object.prototype.hasOwnProperty.call(update, 'page')) delete next.page

  for (const [key, value] of Object.entries(update)) {
    if (value === undefined || value === '') delete next[key]
    else next[key] = String(value)
  }

  return next
}

/** Keeps table state in the URL and refetches after browser navigation. */
export function usePaginatedQuery(
  defaults: PaginatedQueryDefaults,
  onChange?: (query: PaginatedQuery) => void | Promise<void>,
): {
  query: Ref<PaginatedQuery>
  updateQuery: (update: PaginatedQueryUpdate, resetPage?: boolean) => Promise<void>
  resetFilters: () => Promise<void>
  toggleSort: (sort: string) => Promise<void>
} {
  const route = useRoute()
  const router = useRouter()
  const query = computed<PaginatedQuery>(() => normalizeQuery(route.query, defaults))

  watch(query, (value) => void onChange?.(value), { immediate: true })

  async function updateQuery(update: PaginatedQueryUpdate, resetPage = false): Promise<void> {
    await router.replace({ query: getUpdatedRouteQuery(route.query, update, resetPage) })
  }

  async function resetFilters(): Promise<void> {
    await router.replace({ query: {} })
  }

  async function toggleSort(sort: string): Promise<void> {
    await updateQuery(getNextSortQuery(query.value, sort), true)
  }

  return { query, updateQuery, resetFilters, toggleSort }
}
