import { describe, expect, it } from 'vitest'
import { createSessionScope, SessionChangedError } from '@/shared/helpers/session-scope'

function owner() {
  return {
    isAuthenticated: true,
    user: { id: 'A' } as { id: string } | null,
    $sessionKey: 'session-A',
  }
}

describe('account action session ownership', () => {
  it('allows a refreshed token or user object within the same session', () => {
    const auth = owner()
    const scope = createSessionScope(auth)
    auth.user = { id: 'A' }
    expect(scope.isCurrent()).toBe(true)
    expect(() => scope.assertCurrent()).not.toThrow()
  })
  it('checks shared identity even before the local account broadcast is processed', () => {
    let current = true
    const auth = { ...owner(), isCurrentSession: (key: string) => current && key === 'session-A' }
    const scope = createSessionScope(auth)
    expect(scope.isCurrent()).toBe(true)
    current = false
    expect(() => scope.assertCurrent()).toThrow(SessionChangedError)
  })
  it.each(['logout', 'missing-user', 'other-account', 'same-account-new-session', 'anonymous'])(
    'rejects %s without adopting replacement credentials',
    (change) => {
      const auth = owner()
      if (change === 'anonymous') {
        auth.user = null
        auth.isAuthenticated = false
      }
      const scope = createSessionScope(auth)
      if (change === 'logout') auth.isAuthenticated = false
      if (change === 'missing-user') auth.user = null
      if (change === 'other-account') auth.user = { id: 'B' }
      if (change === 'same-account-new-session') auth.$sessionKey = 'session-B'
      if (change === 'anonymous') {
        auth.user = { id: 'A' }
        auth.isAuthenticated = true
        auth.$sessionKey = 'session-B'
      }
      expect(scope.isCurrent()).toBe(false)
      expect(() => scope.assertCurrent()).toThrow(SessionChangedError)
    },
  )
})
