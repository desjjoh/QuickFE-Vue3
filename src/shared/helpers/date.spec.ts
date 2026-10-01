import { describe, expect, it } from 'vitest'

import { normalizeDateTimeLocale } from './date'

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
