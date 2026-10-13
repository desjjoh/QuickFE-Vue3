import { describe, expect, it } from 'vitest'

import {
  normalizeDateTimeLocale,
  isValidIsoDate,
  formatIsoDate,
  getAgeFromIsoDate,
  formatLocalizedDateTime,
} from './date'

describe('normalizeDateTimeLocale', () => {
  it.each([
    ['en', 'en-GB'],
    ['es', 'es-ES'],
    ['fr', 'fr-FR'],
    ['de-DE', 'de-DE'],
  ])('normalizes %s to %s', (locale, expected) => {
    expect(normalizeDateTimeLocale(locale)).toBe(expected)
  })
})

describe('date boundaries and malformed input', () => {
  it.each(['2024-02-29', '2000-02-29', '2026-12-31'])('accepts calendar date %s', (date) =>
    expect(isValidIsoDate(date)).toBe(true),
  )
  it.each([
    '',
    'bad',
    '2026-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-00-01',
    '2026-13-01',
    '2026-01-00',
    '2026-1-1',
  ])('rejects malformed calendar date %s', (date) => expect(isValidIsoDate(date)).toBe(false))
  it('formats date-only values consistently without timezone shifts or impossible-date rollover', () => {
    expect(formatIsoDate('2026-01-01', 'en-US')).toBe('Jan 1, 2026')
    expect(formatIsoDate('2026-01-01T23:59:59Z', 'en-US')).toBe('Jan 1, 2026')
    expect(formatIsoDate('bad')).toBe('bad')
    expect(formatIsoDate('2026-02-30')).toBe('2026-02-30')
  })
  it('handles birthdays, future births and invalid dates', () => {
    expect(getAgeFromIsoDate('2000-10-13', new Date(2026, 9, 12))).toBe(25)
    expect(getAgeFromIsoDate('2000-10-13', new Date(2026, 9, 13))).toBe(26)
    expect(getAgeFromIsoDate('2030-01-01', new Date(2026, 0, 1))).toBeNull()
    expect(getAgeFromIsoDate('invalid')).toBeNull()
    expect(getAgeFromIsoDate('2000-01-01', new Date(NaN))).toBeNull()
  })
  it.each([null, undefined, new Date(NaN)])(
    'returns no display text for invalid timestamp %j',
    (value) => expect(formatLocalizedDateTime(value, 'en')).toBe(''),
  )
  it('formats valid dates across supported locales without mutating them', () => {
    const date = new Date('2026-01-01T12:00:00Z')
    const timestamp = date.getTime()
    for (const locale of ['en', 'fr', 'es'])
      for (const format of ['short', 'long', 'compact'] as const)
        expect(formatLocalizedDateTime(date, locale, format)).toContain('2026')
    expect(date.getTime()).toBe(timestamp)
  })
})
