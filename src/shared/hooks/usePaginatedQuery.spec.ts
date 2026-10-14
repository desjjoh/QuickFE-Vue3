import { describe, expect, it } from 'vitest'
import {
  getNextSortQuery,
  getUpdatedRouteQuery,
  normalizePaginatedQuery,
} from './usePaginatedQuery'

describe('pagination URL defaults', () => {
  it('clears optional filters and starts sorting when a URL has a sort but no direction', () => {
    expect(getNextSortQuery({ sort: 'event' }, 'event')).toEqual({ sort: 'event', order: 'ASC' })
    expect(
      getUpdatedRouteQuery({ search: 'query', sort: 'event' }, { search: '', sort: undefined }),
    ).toEqual({})
  })
  it('omits take only when it equals the configured default', () => {
    expect(getUpdatedRouteQuery({ page: ['2'], take: null }, {})).toEqual({
      page: ['2'],
      take: null,
    })
    expect(getUpdatedRouteQuery({ take: '50' }, { take: 25 }, false, 1, 25)).toEqual({})
    expect(getUpdatedRouteQuery({}, { take: 10 }, false, 1, 25)).toEqual({ take: '10' })
  })
  it('removes an existing default take while preserving filters', () => {
    expect(getUpdatedRouteQuery({ take: '25', domain: 'identity' }, {}, false, 1, 25)).toEqual({
      domain: 'identity',
    })
  })
  it('restores omitted page and take from the same defaults', () => {
    const defaults = { page: 3, take: 25 }
    const query = getUpdatedRouteQuery({}, defaults, false, defaults.page, defaults.take)
    expect(query).toEqual({})
    expect(normalizePaginatedQuery({}, defaults)).toEqual(defaults)
  })
  it('omits a selected page when it matches the configured default', () => {
    expect(getUpdatedRouteQuery({ page: '5', take: '25' }, { page: 3 }, false, 3)).toEqual({
      take: '25',
    })
  })
  it('keeps page 1 when it is not the configured default', () => {
    expect(getUpdatedRouteQuery({}, { page: 1 }, false, 3)).toEqual({ page: '1' })
  })
  it('removes an existing default page while preserving other parameters', () => {
    expect(getUpdatedRouteQuery({ page: '3', domain: 'identity' }, { take: 25 }, false, 3)).toEqual(
      { domain: 'identity', take: '25' },
    )
  })
  it('resets pagination to the implicit default for search and sorting', () => {
    const query = getUpdatedRouteQuery(
      { page: '5', take: '25' },
      { sort: 'event', order: 'ASC' },
      true,
      3,
    )
    expect(query).toEqual({ take: '25', sort: 'event', order: 'ASC' })
    expect(
      normalizePaginatedQuery(query as Record<string, string>, { page: 3, take: 25 }).page,
    ).toBe(3)
  })
  it('omits the default after changing page size and keeps other pages explicit', () => {
    expect(getUpdatedRouteQuery({ page: '2' }, { take: 50, page: 1 })).toEqual({ take: '50' })
    expect(getUpdatedRouteQuery({}, { page: 2 })).toEqual({ page: '2' })
  })
})
