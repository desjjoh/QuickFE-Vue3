import { describe, expect, it } from 'vitest'
import {
  activityFilterDraft,
  activityFilterQuery,
} from '@/views/administration/helpers/activity-filters'
import {
  profileActivityFilterKeys,
  profileActivityFilters,
  profileActivityQuery,
} from '@/views/profile/helpers/activity-query'

describe('Profile activity filters', () => {
  it('reads the selected event and dates from the URL without sending actor or search parameters', () => {
    expect(
      profileActivityQuery({
        page: '2',
        take: '25',
        sort: 'event',
        order: 'DESC',
        event: ['identity.sign_in.succeeded', 'ignored'],
        occurredFrom: '2026-10-01T04:00:00.000Z',
        occurredTo: '2026-10-14T03:59:59.999Z',
        actorId: 'ignored',
        search: 'ignored',
      }),
    ).toEqual({
      page: 2,
      take: 25,
      sort: 'event',
      order: 'DESC',
      event: 'identity.sign_in.succeeded',
      occurredFrom: '2026-10-01T04:00:00.000Z',
      occurredTo: '2026-10-14T03:59:59.999Z',
    })
  })

  it('applies local date boundaries and clears filters while retaining the sort and page size', () => {
    const url = { page: '2', take: '25', sort: 'event', order: 'DESC' }
    const draft = activityFilterDraft(
      profileActivityFilters({
        event: 'identity.sign_in.succeeded',
        occurredFrom: '2026-10-01',
        occurredTo: '2026-10-13',
      }),
    )
    const options = { keys: profileActivityFilterKeys, defaultTake: 10 }

    expect(activityFilterQuery(url, draft, options)).toEqual({
      take: '25',
      sort: 'event',
      order: 'DESC',
      event: 'identity.sign_in.succeeded',
      occurredFrom: new Date(2026, 9, 1).toISOString(),
      occurredTo: new Date(2026, 9, 13, 23, 59, 59, 999).toISOString(),
    })
    expect(activityFilterQuery(url, undefined, options)).toEqual({
      take: '25',
      sort: 'event',
      order: 'DESC',
    })
  })
})
