import { describe, expect, it } from 'vitest'
import {
  formatOffsetLabel,
  getTimezoneName,
  getTimezoneOffsetMinutes,
  sortTimezonesByOffset,
} from '@/shared/helpers/time-zone'
import { CountryDto } from '@/library/models/reference'
import { buildUser } from '@test/support/fixtures'
import { formatPostalCode } from '@/shared/helpers/reference'

describe('timezone and postal formatting', () => {
  it.each([
    [0, '+00:00'],
    [-300, '-05:00'],
    [330, '+05:30'],
    [345, '+05:45'],
  ])('formats offset %i', (value, expected) => expect(formatOffsetLabel(value)).toBe(expected))
  it('resolves daylight-saving offsets and fractional-hour zones at explicit instants', () => {
    expect(getTimezoneOffsetMinutes('America/Toronto', new Date('2026-01-01T12:00:00Z'))).toBe(-300)
    expect(getTimezoneOffsetMinutes('America/Toronto', new Date('2026-07-01T12:00:00Z'))).toBe(-240)
    expect(getTimezoneOffsetMinutes('Asia/Kathmandu', new Date('2026-01-01T12:00:00Z'))).toBe(345)
    expect(getTimezoneName('UTC', 'longOffset')).toMatch(/GMT|UTC/)
  })
  it('rejects invalid timezone/date inputs', () => {
    expect(() => getTimezoneOffsetMinutes('not-a-zone')).toThrow(RangeError)
    expect(() => getTimezoneOffsetMinutes('UTC', new Date(NaN))).toThrow(RangeError)
    expect(() => getTimezoneName('not-a-zone', 'long')).toThrow(RangeError)
  })
  it('sorts by offset then key without modifying the supplied list', () => {
    const base = { label: '', long_name: '', offset_label: '', region: '', exemplar_city: '' }
    const input = Object.freeze([
      { ...base, key: 'zone10', offset_minutes: 60 },
      { ...base, key: 'zone2', offset_minutes: 60 },
      { ...base, key: 'early', offset_minutes: -60 },
    ])
    expect(sortTimezonesByOffset(input).map((item) => item.key)).toEqual([
      'early',
      'zone2',
      'zone10',
    ])
    expect(input[0]!.key).toBe('zone10')
    expect(sortTimezonesByOffset([])).toEqual([])
  })
  it('normalizes, groups, truncates, and handles empty/unknown postal formats', () => {
    const country = new CountryDto({
      ...buildUser().profile.region.country,
      postal_code_format_groups: [3, 3],
      postal_code_format_separator: ' ',
    })
    expect(formatPostalCode(' k1a-0b1-extra ', country)).toBe('K1A 0B1')
    expect(formatPostalCode('k1a0', country)).toBe('K1A 0')
    expect(formatPostalCode('!!!', country)).toBe('')
    expect(formatPostalCode('ab-12', undefined)).toBe('AB12')
    expect(country.postal_code_format_groups).toEqual([3, 3])
  })
})
