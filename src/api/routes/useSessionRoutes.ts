import type { AxiosResponse } from 'axios'

import { AxiosService } from '@/helpers/request'
import { SessionDto, type Session } from '@/library/models/user'

import { instance } from '../useLocalhostAPI'

const { requestConfig } = AxiosService

export interface SessionRoutes {
  list: (accessToken: string, csrfToken: string) => Promise<SessionDto[]>
  revoke: (accessToken: string, csrfToken: string, sessionId: string) => Promise<void>
  revokeAll: (accessToken: string, csrfToken: string) => Promise<void>
}

export function useSessionRoutes(): SessionRoutes {
  const protectedConfig = (accessToken: string, csrfToken: string) =>
    requestConfig({ token: accessToken, withCredentials: true, csrfToken })

  async function list(accessToken: string, csrfToken: string): Promise<SessionDto[]> {
    return instance
      .get<(Session | null)[]>('account/sessions', protectedConfig(accessToken, csrfToken))
      .then(({ data }: AxiosResponse<(Session | null)[]>): SessionDto[] =>
        data
          .filter((session): session is Session => session !== null)
          .map((session) => new SessionDto(session)),
      )
  }

  async function revoke(accessToken: string, csrfToken: string, sessionId: string): Promise<void> {
    await instance.delete<void>(
      `account/sessions/${sessionId}`,
      protectedConfig(accessToken, csrfToken),
    )
  }

  async function revokeAll(accessToken: string, csrfToken: string): Promise<void> {
    await instance.delete<void>('sessions', protectedConfig(accessToken, csrfToken))
  }

  return { list, revoke, revokeAll }
}
