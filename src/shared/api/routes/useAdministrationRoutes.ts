import { AxiosService } from '@/shared/helpers/request'
import { PaginatedDto, type Paginated } from '@/library/models/pagination'
import { UserDto, type User } from '@/library/models/user'
import {
  AuditDto,
  type AuditOutcome,
  type AuditPage,
  type AuditRecord,
} from '@/library/models/audit'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

export type AdministrationUserSort =
  | 'user.createdAt'
  | 'profile.name.last'
  | 'user.identity.email'
  | 'fullname'

export type AdministrationSortOrder = 'ASC' | 'DESC'

export interface AdministrationUsersQuery {
  search?: string
  order?: AdministrationSortOrder
  page?: number
  take?: number
  sort?: AdministrationUserSort
}

export interface AdministrationUserRoutes {
  getUsers: (
    token: string,
    query?: AdministrationUsersQuery,
  ) => Promise<PaginatedDto<UserDto, User>>
  getUser: (token: string, id: string) => Promise<UserDto>
  deleteUser: (token: string, id: string, reasonCode: AdministrationReasonCode) => Promise<void>
  updateUser: (token: string, id: string, payload: AdministrationUserUpdate) => Promise<UserDto>
  activity: (
    token: string,
    id: string,
    query?: AdministrationUserActivityQuery,
  ) => Promise<AuditPage>
}

export const administrationReasonCodes = [
  'security_response',
  'policy_enforcement',
  'access_review',
  'user_request',
  'data_correction',
] as const
export type AdministrationReasonCode = (typeof administrationReasonCodes)[number]
export interface AdministrationUserUpdate {
  reason_code: AdministrationReasonCode
  status_id?: string
  role_ids?: string[]
}
export interface AdministrationUserActivityQuery {
  actor?: string
  event?: string
  outcome?: AuditOutcome
  occurredFrom?: string
  occurredTo?: string
  page?: number
  take?: number
}
export interface AdministrationAuditQuery {
  domain?: string
  event?: string
  outcome?: AuditOutcome
  actorType?: string
  actorId?: string
  occurredFrom?: string
  occurredTo?: string
  page?: number
  take?: number
}
export interface AdministrationAuditRoutes {
  search: (token: string, query?: AdministrationAuditQuery) => Promise<AuditPage>
  detail: (token: string, id: string) => Promise<AuditRecord>
}

export interface AdministrationRoutes {
  users: AdministrationUserRoutes
  audits: AdministrationAuditRoutes
}

export function useAdministrationRoutes(): AdministrationRoutes {
  const users: AdministrationUserRoutes = useAdministrationUserRoutes()
  const audits: AdministrationAuditRoutes = useAdministrationAuditRoutes()

  return {
    users,
    audits,
  }
}

export function useAdministrationUserRoutes(): AdministrationUserRoutes {
  async function getUsers(
    token: string,
    query: AdministrationUsersQuery = {},
  ): Promise<PaginatedDto<UserDto, User>> {
    return instance
      .get<Paginated<User>>('administration/users', requestConfig({ token, params: { ...query } }))
      .then(
        ({ data }: { data: Paginated<User> }): PaginatedDto<UserDto, User> =>
          new PaginatedDto(data, UserDto),
      )
  }

  async function getUser(token: string, id: string): Promise<UserDto> {
    return instance
      .get<User>(`administration/users/${id}`, requestConfig({ token }))
      .then(parseResponse(UserDto))
  }

  async function deleteUser(
    token: string,
    id: string,
    reasonCode: AdministrationReasonCode,
  ): Promise<void> {
    await instance.post<void>(
      `administration/users/${id}/delete`,
      { reason_code: reasonCode },
      requestConfig({ token }),
    )
  }

  async function updateUser(
    token: string,
    id: string,
    payload: AdministrationUserUpdate,
  ): Promise<UserDto> {
    return instance
      .patch<User>(`administration/users/${id}`, payload, requestConfig({ token }))
      .then(parseResponse(UserDto))
  }

  async function activity(
    token: string,
    id: string,
    query: AdministrationUserActivityQuery = {},
  ): Promise<AuditPage> {
    return instance
      .get<
        Paginated<AuditRecord>
      >(`administration/users/${id}/activity`, requestConfig({ token, params: { ...query } }))
      .then(({ data }) => new PaginatedDto(data, AuditDto))
  }

  return {
    getUsers,
    getUser,
    deleteUser,
    updateUser,
    activity,
  }
}

export function useAdministrationAuditRoutes(): AdministrationAuditRoutes {
  const search = (token: string, query: AdministrationAuditQuery = {}): Promise<AuditPage> =>
    instance
      .get<
        Paginated<AuditRecord>
      >('administration/audits', requestConfig({ token, params: { ...query } }))
      .then(({ data }) => new PaginatedDto(data, AuditDto))
  const detail = (token: string, id: string): Promise<AuditDto> =>
    instance
      .get<AuditRecord>(`administration/audits/${encodeURIComponent(id)}`, requestConfig({ token }))
      .then(parseResponse(AuditDto))
  return { search, detail }
}
