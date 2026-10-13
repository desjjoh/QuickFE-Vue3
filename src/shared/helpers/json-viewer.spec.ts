import { describe, expect, it } from 'vitest'
import { toSafeJson, prettyJsonToHtml } from './json-viewer'

describe('safe JSON serialization boundaries', () => {
  it('normalizes undefined, nonfinite numbers, dates and bigint without mutating data', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const input = { missing: undefined, infinite: Infinity, bigint: 12n, date }
    expect(toSafeJson(input)).toEqual({ infinite: null, bigint: '12', date: date.toISOString() })
    expect(input.date).toBe(date)
    expect(input.bigint).toBe(12n)
    expect(toSafeJson(undefined)).toBeNull()
    expect(toSafeJson(() => null)).toBeNull()
  })
  it('marks actual cycles while retaining repeated sibling references', () => {
    const shared = { value: 1 }
    const cycle: { self?: unknown; first: unknown; second: unknown } = {
      first: shared,
      second: shared,
    }
    cycle.self = cycle
    expect(toSafeJson(cycle)).toEqual({
      first: { value: 1 },
      second: { value: 1 },
      self: '[Circular]',
    })
  })
  it('propagates failed custom serialization rather than modifying the input', () =>
    expect(() =>
      toSafeJson({
        toJSON() {
          throw new Error('serialize failed')
        },
      }),
    ).toThrow('serialize failed'))
  it('escapes keys and values and handles empty containers and invalid display limits', () => {
    const html = prettyJsonToHtml(
      { '<script>': '&<b>' },
      { indentSize: NaN, maxStringLength: Infinity },
    )
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&amp;&lt;b&gt;')
    expect(prettyJsonToHtml({})).toContain('(empty)')
    expect(prettyJsonToHtml([])).toContain('[ ]')
    expect(prettyJsonToHtml('long', { maxStringLength: -1 })).toContain('…')
  })
})
