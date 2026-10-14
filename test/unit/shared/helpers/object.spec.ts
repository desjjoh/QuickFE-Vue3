import { describe, expect, it } from 'vitest'
import { deepEqual, checkIds } from '@/shared/helpers/object'

describe('object comparisons', () => {
  it.each([
    [null, null, true],
    [null, {}, false],
    [NaN, NaN, true],
    [0, -0, false],
    [1, '1', false],
    [[], {}, false],
    [[1, 2], [2, 1], false],
    [{ a: 1 }, { a: 1, b: 2 }, false],
    [new Date(0), new Date(0), true],
    [new Date(0), new Date(1), false],
  ])('compares %j and %j', (left, right, expected) => expect(deepEqual(left, right)).toBe(expected))
  it('compares nested objects independently of key order without mutation', () => {
    const left = Object.freeze({ a: [1, { b: false }], c: null })
    expect(deepEqual(left, { c: null, a: [1, { b: false }] })).toBe(true)
    expect(deepEqual(left, { c: null, a: [1, { b: true }] })).toBe(false)
  })
  it('distinguishes different keys whose values are undefined', () =>
    expect(deepEqual({ a: undefined }, { b: undefined })).toBe(false))
  it('checks present IDs without throwing for missing objects', () => {
    expect(checkIds({ id: 'one' }, { id: 'one' })).toBe(true)
    expect(checkIds({ id: 'one' }, { id: 'two' })).toBe(false)
    expect(checkIds(null, undefined)).toBe(false)
    expect(checkIds({}, {})).toBe(false)
    expect(checkIds(null, null)).toBe(false)
    expect(checkIds(undefined, undefined)).toBe(false)
    expect(checkIds({ id: 0 }, { id: 0 })).toBe(true)
    expect(checkIds({ id: 1 }, { id: '1' })).toBe(false)
  })
})
