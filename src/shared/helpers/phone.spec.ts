import { describe, expect, it } from 'vitest'

import { formatPhoneDigitGroups } from './phone'

describe('formatPhoneDigitGroups', () => {
  it('normalizes and groups phone digits with the requested separator', () => {
    expect(formatPhoneDigitGroups('(555) 123-4567', [3, 3, 4], '-')).toBe('555-123-4567')
    expect(formatPhoneDigitGroups('(555) 123-4567', [3, 3, 4])).toBe('555 123 4567')
  })

  it('keeps digits that extend beyond the configured groups', () => {
    expect(formatPhoneDigitGroups('1234567', [3, 2], '-')).toBe('123-45-67')
  })

  it('returns normalized digits when no groups are configured', () => {
    expect(formatPhoneDigitGroups('+1 (555)', undefined)).toBe('1555')
  })
})
