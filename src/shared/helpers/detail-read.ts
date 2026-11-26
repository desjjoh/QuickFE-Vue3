import { isAxiosError } from 'axios'
import { runAuthenticatedRead, type AuthenticatedRequestOptions } from './load-authorized-read'

export type DetailReadError = 'unavailable' | 'forbidden' | 'unauthorized' | 'failed'

interface DetailState<T> {
  detail: T | null
  detailError: DetailReadError | null
  detailOwner: string | null
  detailRequestId: string
}

export function clearDetailRead<T>(state: DetailState<T>, owner?: string): void {
  if (owner !== undefined && state.detailOwner !== owner) return
  state.detailRequestId = crypto.randomUUID()
  state.detailOwner = null
  state.detail = null
  state.detailError = null
}

function detailReadError(cause: unknown): DetailReadError {
  const status = isAxiosError(cause) ? cause.response?.status : undefined

  if (status === 404) return 'unavailable'
  if (status === 403) return 'forbidden'
  if (status === 401) return 'unauthorized'

  return 'failed'
}

export function loadDetailRead<T, Credentials>(
  state: DetailState<T>,
  owner: string,
  request: Pick<
    AuthenticatedRequestOptions<Credentials, T>,
    'permissions' | 'getCredentials' | 'load'
  >,
): Promise<void> {
  clearDetailRead(state)
  state.detailOwner = owner
  const requestId = state.detailRequestId

  return runAuthenticatedRead({
    ...request,
    start: () => () => state.detailRequestId === requestId,
    onAccessDenied: (reason) => {
      state.detailError = reason
    },
    onAccessLost: () => clearDetailRead(state, owner),
    onSuccess: (record) => {
      state.detail = record
    },
    onError: (cause) => {
      state.detailError = detailReadError(cause)
    },
  })
}
