import type { PermissionKey } from '@/config/permissions'
import { useAuthStore } from '@/shared/stores/auth'
import { createSessionScope } from './session-scope'

interface AuthorizedReadState {
  requestId: string
  loading: boolean
  error: string | null
}

interface AuthorizedReadOptions<T> {
  permissions: readonly PermissionKey[]
  load: (token: string) => Promise<T>
  clear: () => void
  onSuccess: (result: T) => void
  onError: (cause: unknown) => void
}

type AccessDenial = 'unauthorized' | 'forbidden'

export interface AuthenticatedRequestOptions<Credentials, T> {
  permissions?: readonly PermissionKey[]
  getCredentials: (auth: ReturnType<typeof useAuthStore>) => Promise<Credentials>
  load: (credentials: Credentials) => Promise<T>
  start: () => () => boolean
  onAccessDenied: (reason: AccessDenial) => void
  onAccessLost: () => void
  onSuccess: (result: T) => void
  onError: (cause: unknown) => void
  onFinish?: () => void
}

export async function runAuthenticatedRead<Credentials, T>({
  permissions,
  getCredentials,
  load,
  start,
  onAccessDenied,
  onAccessLost,
  onSuccess,
  onError,
  onFinish,
}: AuthenticatedRequestOptions<Credentials, T>): Promise<void> {
  const auth = useAuthStore()
  const session = createSessionScope(auth)

  function accessDenial(): AccessDenial | null {
    if (!session.isCurrent()) return 'unauthorized'

    return permissions && !auth.canActivate(permissions) ? 'forbidden' : null
  }

  const denial = accessDenial()

  if (denial) {
    onAccessDenied(denial)

    return
  }

  const isLatestRequest = start()

  const canContinue = () => {
    // A superseded request must leave the current request's state alone.
    if (!isLatestRequest()) return false
    if (!accessDenial()) return true

    onAccessLost()

    return false
  }

  try {
    const credentials = await getCredentials(auth)

    if (!canContinue()) return
    const result = await load(credentials)

    if (canContinue()) onSuccess(result)
  } catch (cause) {
    if (canContinue()) onError(cause)
  } finally {
    if (isLatestRequest()) onFinish?.()
  }
}

export function runAuthorizedRead<T>(
  options: Omit<AuthenticatedRequestOptions<string, T>, 'getCredentials'>,
): Promise<void> {
  return runAuthenticatedRead({
    ...options,
    getCredentials: (auth) => auth.getValidAccessToken(),
  })
}

export function loadAuthorizedRead<T>(
  state: AuthorizedReadState,
  { permissions, load, clear, onSuccess, onError }: AuthorizedReadOptions<T>,
): Promise<void> {
  return runAuthorizedRead({
    permissions,
    load,
    start: () => {
      const requestId = crypto.randomUUID()

      state.requestId = requestId
      state.loading = true
      state.error = null

      return () => state.requestId === requestId
    },
    onAccessDenied: clear,
    onAccessLost: clear,
    onSuccess,
    onError,
    onFinish: () => {
      state.loading = false
    },
  })
}
