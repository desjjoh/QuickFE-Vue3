import { describe, expect, it } from 'vitest'
import {
  activityFilterDraft,
  activityFilterQuery,
  validateActivityFilters,
} from './activity-filters'

const blank = () => ({
  domain: '',
  event: '',
  actorType: '',
  actorId: '',
  occurredFrom: '',
  occurredTo: '',
})
describe('activity filter contracts', () => {
  it('omits the default take when applying or clearing filters', () => {
    expect(
      activityFilterQuery({ page: '4', take: '10' }, { ...blank(), domain: 'identity' }),
    ).toEqual({ domain: 'identity' })
    expect(activityFilterQuery({ take: '10', domain: 'identity' })).toEqual({})
  })
  it('replaces filters atomically while preserving sort and page size', () => {
    const result = activityFilterQuery(
      { page: '4', take: '25', sort: 'domain', order: 'ASC', event: 'old', search: 'legacy' },
      { ...blank(), domain: 'articles', actorId: ' actor ' },
    )
    expect(result).toEqual({
      take: '25',
      sort: 'domain',
      order: 'ASC',
      domain: 'articles',
      actorId: 'actor',
    })
  })
  it('clears only filter and search parameters', () => {
    expect(
      activityFilterQuery({
        page: '4',
        take: '50',
        sort: 'event',
        order: 'DESC',
        domain: 'identity',
        event: 'old',
        actorId: 'actor',
        occurredFrom: '2026-10-01',
        search: 'legacy',
      }),
    ).toEqual({ take: '50', sort: 'event', order: 'DESC' })
  })
  it('preserves future domain/event values from shared URLs', () => {
    const draft = activityFilterDraft({
      domain: 'future',
      event: 'future.action.completed',
      actorType: 'system',
      actorId: 'system-1',
    })
    expect(draft).toEqual({
      ...blank(),
      domain: 'future',
      event: 'future.action.completed',
      actorType: 'system',
      actorId: 'system-1',
    })
    expect(validateActivityFilters(draft)).toBeNull()
  })
  it('uses local full-day bounds and round-trips dates through URL timestamps', () => {
    const draft = { ...blank(), occurredFrom: '2026-10-01', occurredTo: '2026-10-13' }
    const query = activityFilterQuery({}, draft)
    expect(query.occurredFrom).toBe(new Date('2026-10-01T00:00:00.000').toISOString())
    expect(query.occurredTo).toBe(new Date('2026-10-13T23:59:59.999').toISOString())
    expect(
      activityFilterDraft({
        occurredFrom: String(query.occurredFrom),
        occurredTo: String(query.occurredTo),
      }),
    ).toEqual(draft)
  })
  it('preserves date-only values in shared links', () => {
    expect(activityFilterDraft({ occurredFrom: '2026-10-01', occurredTo: '2026-10-13' })).toEqual({
      ...blank(),
      occurredFrom: '2026-10-01',
      occurredTo: '2026-10-13',
    })
  })
  it.each(['2026-02-30', '2026-13-01', '2026-10', 'not-a-date'])(
    'rejects invalid date %s',
    (date) => {
      expect(validateActivityFilters({ ...blank(), occurredFrom: date })).toBe('invalidDate')
    },
  )
  it('rejects reversed dates but allows same-day ranges', () => {
    expect(
      validateActivityFilters({ ...blank(), occurredFrom: '2026-10-13', occurredTo: '2026-10-01' }),
    ).toBe('dateRange')
    expect(
      validateActivityFilters({ ...blank(), occurredFrom: '2026-10-13', occurredTo: '2026-10-13' }),
    ).toBeNull()
  })
  it('rejects unsupported actors and overlong values', () => {
    expect(validateActivityFilters({ ...blank(), actorType: 'future' })).toBe('invalidActor')
    expect(validateActivityFilters({ ...blank(), event: 'x'.repeat(129) })).toBe('tooLong')
  })
})
