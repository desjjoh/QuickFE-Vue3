export class SessionChangedError extends Error {
  constructor(message = 'Session changed while the action was pending') {
    super(message)
    this.name = 'SessionChangedError'
  }
}

interface SessionOwner {
  isCurrentSession?: (key: string) => boolean
  readonly $sessionKey: string
  readonly isAuthenticated: boolean
  readonly user: { readonly id: string } | null
}

export interface SessionScope {
  isCurrent: () => boolean
  assertCurrent: () => void
}

/** Capture when an account action or private data load starts, before any asynchronous work. */
export function createSessionScope(owner: SessionOwner): SessionScope {
  const sessionKey = owner.$sessionKey
  const userId = owner.user?.id
  const isCurrent = () =>
    !!userId &&
    owner.isAuthenticated &&
    owner.$sessionKey === sessionKey &&
    owner.user?.id === userId &&
    (owner.isCurrentSession?.(sessionKey) ?? true)

  return {
    isCurrent,
    assertCurrent: () => {
      if (!isCurrent()) throw new SessionChangedError()
    },
  }
}
