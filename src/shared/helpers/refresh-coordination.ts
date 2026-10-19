/** A coordination failure does not prove that the current authentication is invalid. */
export class RefreshCoordinationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RefreshCoordinationError'
  }
}
