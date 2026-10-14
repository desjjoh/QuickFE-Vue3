import { describe, expect, it, vi } from 'vitest'
import { assertDefined } from '@/shared/helpers/assert'
import { emptyStringToNull } from '@/shared/helpers/strings'
import { isValidRouteParam, isValidRouteQueryParam } from '@/shared/helpers/routes'
import { evaluateRouteAccess } from '@/shared/helpers/route-access'
import { getAppShellScrollContainer, getReducedMotionBehavior } from '@/shared/helpers/window'
import { sleep } from '@/shared/helpers/sleep'
import { second, minute, hour, day } from '@/shared/helpers/time'
import { useTestClock } from '@test/support/async'
import { RoleKey, AuditPermissions } from '@/config/permissions'

describe('shared scalar and route helpers', () => {
  it.each([null, undefined])('rejects missing value %s', (value) =>
    expect(() => assertDefined(value, 'missing')).toThrow('missing'),
  )
  it.each([0, false, '', [], {}])('preserves defined falsy/empty values %j', (value) =>
    expect(() => assertDefined(value, 'missing')).not.toThrow(),
  )
  it.each([
    ['  hello  ', 'hello'],
    ['', null],
    [' \n\t', null],
    [null, null],
    [42, '42'],
  ])('normalizes %j without coercing whitespace into content', (input, expected) =>
    expect(emptyStringToNull(input, input)).toBe(expected),
  )
  it.each(['id', '  id  ', '0'])('accepts scalar route value %s', (value) => {
    expect(isValidRouteParam(value)).toBe(true)
    expect(isValidRouteQueryParam(value)).toBe(true)
  })
  it.each([undefined, '', ' ', ['id'], []])(
    'rejects absent, blank and array route values %j',
    (value) => {
      expect(isValidRouteParam(value)).toBe(false)
      expect(isValidRouteQueryParam(value)).toBe(false)
    },
  )
  it('distinguishes guests, role denial, permission denial and public routes', () => {
    expect(evaluateRouteAccess({ requiresAuth: true }, false, false, false)).toBe('unauthorized')
    expect(evaluateRouteAccess({ requiredRoles: [RoleKey.ADMINISTRATOR] }, true, false, true)).toBe(
      'forbidden',
    )
    expect(
      evaluateRouteAccess(
        { requiredPermissions: [AuditPermissions.READ_AUDIT_DETAIL] },
        true,
        true,
        false,
      ),
    ).toBe('forbidden')
    expect(
      evaluateRouteAccess(
        {
          requiresAuth: true,
          requiredRoles: [RoleKey.ADMINISTRATOR],
          requiredPermissions: [AuditPermissions.READ_AUDIT_DETAIL],
        },
        true,
        true,
        true,
      ),
    ).toBe('allowed')
    expect(evaluateRouteAccess({}, false, false, false)).toBe('allowed')
  })
  it('finds the shell only when present and respects reduced motion', () => {
    expect(getAppShellScrollContainer()).toBeNull()
    const shell = document.createElement('div')
    shell.dataset.appShellScroll = ''
    document.body.append(shell)
    try {
      expect(getAppShellScrollContainer()).toBe(shell)
    } finally {
      shell.remove()
    }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    )
    expect(getReducedMotionBehavior()).toBe('auto')
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    )
    expect(getReducedMotionBehavior()).toBe('smooth')
  })
  it('waits for the requested duration without a real delay', async () => {
    const clock = useTestClock()
    const resolved = vi.fn()
    const pending = sleep(100).then(resolved)
    await clock.advance(99)
    expect(resolved).not.toHaveBeenCalled()
    await clock.advance(1)
    await pending
    expect(resolved).toHaveBeenCalledOnce()
    expect([second, minute, hour, day]).toEqual([1000, 60000, 3600000, 86400000])
  })
})
