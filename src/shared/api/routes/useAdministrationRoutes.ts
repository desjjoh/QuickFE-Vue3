import type { AxiosRequestConfig } from 'axios'
import { AxiosService, type IdempotencyOptions } from '@/shared/helpers/request'
import { PaginatedDto, type Paginated } from '@/library/models/pagination'
import {
  UserAdministrationDto,
  AdministrationUsersQueryDto,
  UpdateUserAdministrationDto,
  UserAdministrationActionDto,
  type UserAdministration,
  type UserAdministrationAction,
} from '@/library/models/administration'
import {
  AuditDto,
  AuditPageDto,
  AdministrationAuditQueryDto,
  AdministrationUserActivityQueryDto,
  type AuditPage,
  type AuditRecord,
} from '@/library/models/audit'

import { instance } from '../useLocalhostAPI'
import {
  ArticleManagementDto,
  ArticleManagementPageDto,
  AdministrationArticleQueryDto,
  ArticleVersionDto,
  ArticleAdministrationActionDto,
  type ArticleManagement,
  type ArticleManagementListItem,
  type AdministrationArticleQuery,
  type ArticleVersion,
  type ArticleAdministrationAction,
} from '@/library/models/articles'

import type {
  AdministrationUsersQuery,
  AdministrationUserUpdate,
} from '@/library/models/administration'
export { administrationReasonCodes } from '@/library/models/administration'
export type {
  AdministrationUsersQuery,
  AdministrationUserUpdate,
  AdministrationReasonCode,
  AdministrationUserSort,
  AdministrationSortOrder,
} from '@/library/models/administration'
import type {
  AdministrationAuditQuery,
  AdministrationUserActivityQuery,
} from '@/library/models/audit'
export type {
  AdministrationAuditQuery,
  AdministrationUserActivityQuery,
} from '@/library/models/audit'

const { parseResponse, requestConfig, idempotentRequestConfig } = AxiosService

export interface AdministrationUserRoutes {
  getUsers: (
    token: string,
    query?: AdministrationUsersQuery,
  ) => Promise<PaginatedDto<UserAdministrationDto, UserAdministration>>
  getUser: (token: string, id: string) => Promise<UserAdministrationDto>
  deleteUser: (
    token: string,
    id: string,
    payload: UserAdministrationAction,
    options?: IdempotencyOptions,
  ) => Promise<void>
  updateUser: (
    token: string,
    id: string,
    payload: AdministrationUserUpdate,
    options?: IdempotencyOptions,
  ) => Promise<UserAdministrationDto>
  activity: (
    token: string,
    id: string,
    query?: AdministrationUserActivityQuery,
  ) => Promise<AuditPage>
}

export interface AdministrationAuditRoutes {
  search: (token: string, query?: AdministrationAuditQuery) => Promise<AuditPage>
  detail: (token: string, id: string) => Promise<AuditDto>
}

export interface AdministrationArticleRoutes {
  list: (
    accessToken: string,
    query?: AdministrationArticleQuery,
  ) => Promise<ArticleManagementPageDto>
  find: (accessToken: string, id: string) => Promise<ArticleManagementDto>
  publish: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleVersion,
    options?: IdempotencyOptions,
  ) => Promise<ArticleManagementDto>
  returnToDraft: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleAdministrationAction,
  ) => Promise<ArticleManagementDto>
  archive: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleAdministrationAction,
    options?: IdempotencyOptions,
  ) => Promise<ArticleManagementDto>
  restore: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleAdministrationAction,
    options?: IdempotencyOptions,
  ) => Promise<ArticleManagementDto>
}

export interface AdministrationRoutes {
  users: AdministrationUserRoutes
  audits: AdministrationAuditRoutes
  articles: AdministrationArticleRoutes
}

export function useAdministrationRoutes(): AdministrationRoutes {
  const users: AdministrationUserRoutes = useAdministrationUserRoutes()
  const audits: AdministrationAuditRoutes = useAdministrationAuditRoutes()
  const articles: AdministrationArticleRoutes = useAdministrationArticleRoutes()

  return {
    users,
    audits,
    articles,
  }
}

export function useAdministrationUserRoutes(): AdministrationUserRoutes {
  async function getUsers(
    token: string,
    query: AdministrationUsersQuery = {},
  ): Promise<PaginatedDto<UserAdministrationDto, UserAdministration>> {
    return instance
      .get<
        Paginated<UserAdministration>
      >('administration/users', requestConfig({ token, params: { ...new AdministrationUsersQueryDto(query) } }))
      .then(
        ({
          data,
        }: {
          data: Paginated<UserAdministration>
        }): PaginatedDto<UserAdministrationDto, UserAdministration> =>
          new PaginatedDto(data, UserAdministrationDto),
      )
  }

  async function getUser(token: string, id: string): Promise<UserAdministrationDto> {
    return instance
      .get<UserAdministration>(
        `administration/users/${encodeURIComponent(id)}`,
        requestConfig({ token }),
      )
      .then(parseResponse(UserAdministrationDto))
  }

  async function deleteUser(
    token: string,
    id: string,
    payload: UserAdministrationAction,
    options: IdempotencyOptions = {},
  ): Promise<void> {
    await instance.post<void>(
      `administration/users/${encodeURIComponent(id)}/delete`,
      new UserAdministrationActionDto(payload),
      idempotentRequestConfig({ token, ...options }),
    )
  }

  async function updateUser(
    token: string,
    id: string,
    payload: AdministrationUserUpdate,
    options: IdempotencyOptions = {},
  ): Promise<UserAdministrationDto> {
    return instance
      .patch<UserAdministration>(
        `administration/users/${encodeURIComponent(id)}`,
        new UpdateUserAdministrationDto(payload),
        idempotentRequestConfig({ token, ...options }),
      )
      .then(parseResponse(UserAdministrationDto))
  }

  async function activity(
    token: string,
    id: string,
    query: AdministrationUserActivityQuery = {},
  ): Promise<AuditPage> {
    return instance
      .get<
        Paginated<AuditRecord>
      >(`administration/users/${encodeURIComponent(id)}/activity`, requestConfig({ token, params: { ...new AdministrationUserActivityQueryDto(query) } }))
      .then(({ data }) => new AuditPageDto(data))
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
      >('administration/audits', requestConfig({ token, params: { ...new AdministrationAuditQueryDto(query) } }))
      .then(({ data }) => new AuditPageDto(data))
  const detail = (token: string, id: string): Promise<AuditDto> =>
    instance
      .get<AuditRecord>(`administration/audits/${encodeURIComponent(id)}`, requestConfig({ token }))
      .then(parseResponse(AuditDto))

  return { search, detail }
}

function articleMutationConfig(
  accessToken: string,
  csrfToken: string,
  options?: IdempotencyOptions,
): AxiosRequestConfig {
  const config = { token: accessToken, csrfToken, withCredentials: true }

  return options ? idempotentRequestConfig({ ...config, ...options }) : requestConfig(config)
}

export function useAdministrationArticleRoutes(): AdministrationArticleRoutes {
  const path = (id: string) => `administration/articles/${encodeURIComponent(id)}`
  const transition = (
    action: 'return-to-draft' | 'archive' | 'restore',
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleAdministrationAction,
    options?: IdempotencyOptions,
  ) =>
    instance
      .post<ArticleManagement>(
        `${path(id)}/${action}`,
        new ArticleAdministrationActionDto(payload),
        articleMutationConfig(accessToken, csrfToken, options),
      )
      .then(parseResponse(ArticleManagementDto))

  return {
    list: (accessToken, query = {}) =>
      instance
        .get<
          Paginated<ArticleManagementListItem>
        >('administration/articles', requestConfig({ token: accessToken, params: { ...new AdministrationArticleQueryDto(query) } }))
        .then(({ data }) => new ArticleManagementPageDto(data)),
    find: (accessToken, id) =>
      instance
        .get<ArticleManagement>(path(id), requestConfig({ token: accessToken }))
        .then(parseResponse(ArticleManagementDto)),
    publish: (accessToken, csrfToken, id, payload, options = {}) =>
      instance
        .post<ArticleManagement>(
          `${path(id)}/publish`,
          new ArticleVersionDto(payload),
          articleMutationConfig(accessToken, csrfToken, options),
        )
        .then(parseResponse(ArticleManagementDto)),
    returnToDraft: (accessToken, csrfToken, id, payload) =>
      transition('return-to-draft', accessToken, csrfToken, id, payload),
    archive: (accessToken, csrfToken, id, payload, options = {}) =>
      transition('archive', accessToken, csrfToken, id, payload, options),
    restore: (accessToken, csrfToken, id, payload, options = {}) =>
      transition('restore', accessToken, csrfToken, id, payload, options),
  }
}
