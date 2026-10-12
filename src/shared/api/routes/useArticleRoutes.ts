import type { AxiosRequestConfig } from 'axios'
import { AxiosService, type IdempotencyOptions } from '@/shared/helpers/request'
import type { Paginated } from '@/library/models/pagination'
import {
  ArticleDto,
  ArticlePageDto,
  ArticleManagementDto,
  ArticleManagementPageDto,
  PublicArticleQueryDto,
  AuthoringArticleQueryDto,
  AdministrationArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
  UpdateArticleHeroDto,
  ArticleVersionDto,
  ArticleAdministrationActionDto,
  type Article,
  type ArticleListItem,
  type ArticleManagement,
  type ArticleManagementListItem,
  type PublicArticleQuery,
  type AuthoringArticleQuery,
  type AdministrationArticleQuery,
  type CreateArticle,
  type UpdateArticle,
  type UpdateArticleHero,
  type ArticleVersion,
  type ArticleAdministrationAction,
} from '@/library/models/articles'
import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig, idempotentRequestConfig } = AxiosService

export interface PublicArticleRoutes {
  list: (query?: PublicArticleQuery) => Promise<ArticlePageDto>
  find: (id: string) => Promise<ArticleDto>
}

export interface AuthoringArticleRoutes {
  list: (accessToken: string, query?: AuthoringArticleQuery) => Promise<ArticleManagementPageDto>
  find: (accessToken: string, id: string) => Promise<ArticleManagementDto>
  create: (
    accessToken: string,
    csrfToken: string,
    payload: CreateArticle,
    hero: File,
    options?: IdempotencyOptions,
  ) => Promise<ArticleManagementDto>
  update: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: UpdateArticle,
  ) => Promise<ArticleManagementDto>
  updateHero: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: UpdateArticleHero,
    hero: File,
    options?: IdempotencyOptions,
  ) => Promise<ArticleManagementDto>
  submit: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleVersion,
  ) => Promise<ArticleManagementDto>
  withdraw: (
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleVersion,
  ) => Promise<ArticleManagementDto>
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

export interface ArticleRoutes {
  public: PublicArticleRoutes
  authoring: AuthoringArticleRoutes
}
export function useArticleRoutes(): ArticleRoutes {
  return { public: usePublicArticleRoutes(), authoring: useAuthoringArticleRoutes() }
}

function mutationConfig(
  accessToken: string,
  csrfToken: string,
  options?: IdempotencyOptions,
): AxiosRequestConfig {
  const config = { token: accessToken, csrfToken, withCredentials: true }
  return options ? idempotentRequestConfig({ ...config, ...options }) : requestConfig(config)
}

/** Only upload DTO fields; omit null/undefined instead of sending literal "null". */
function heroFormData(payload: CreateArticleDto | UpdateArticleHeroDto, hero: File): FormData {
  const data = new FormData()
  data.append('hero', hero)
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) data.append(key, String(value))
  }
  return data
}

function uploadConfig(
  accessToken: string,
  csrfToken: string,
  options: IdempotencyOptions,
): AxiosRequestConfig {
  return {
    ...idempotentRequestConfig({
      token: accessToken,
      csrfToken,
      withCredentials: true,
      contentType: 'multipart/form-data',
      ...options,
    }),
    // QuickAPI permits 90 seconds for image validation, storage and SQL work.
    timeout: 90_000,
  }
}

export function usePublicArticleRoutes(): PublicArticleRoutes {
  return {
    list: (query = {}) =>
      instance
        .get<
          Paginated<ArticleListItem>
        >('articles/public', requestConfig({ params: { ...new PublicArticleQueryDto(query) } }))
        .then(({ data }) => new ArticlePageDto(data)),
    find: (id) =>
      instance
        .get<Article>(`articles/public/${encodeURIComponent(id)}`)
        .then(parseResponse(ArticleDto)),
  }
}

export function useAuthoringArticleRoutes(): AuthoringArticleRoutes {
  const path = (id: string) => `articles/me/${encodeURIComponent(id)}`
  const transition = (
    action: 'submit' | 'withdraw',
    accessToken: string,
    csrfToken: string,
    id: string,
    payload: ArticleVersion,
  ) =>
    instance
      .post<ArticleManagement>(
        `${path(id)}/${action}`,
        new ArticleVersionDto(payload),
        mutationConfig(accessToken, csrfToken),
      )
      .then(parseResponse(ArticleManagementDto))
  return {
    list: (accessToken, query = {}) =>
      instance
        .get<
          Paginated<ArticleManagementListItem>
        >('articles/me', requestConfig({ token: accessToken, params: { ...new AuthoringArticleQueryDto(query) } }))
        .then(({ data }) => new ArticleManagementPageDto(data)),
    find: (accessToken, id) =>
      instance
        .get<ArticleManagement>(path(id), requestConfig({ token: accessToken }))
        .then(parseResponse(ArticleManagementDto)),
    create: (accessToken, csrfToken, payload, hero, options = {}) =>
      instance
        .post<ArticleManagement>(
          'articles/me',
          heroFormData(new CreateArticleDto(payload), hero),
          uploadConfig(accessToken, csrfToken, options),
        )
        .then(parseResponse(ArticleManagementDto)),
    update: (accessToken, csrfToken, id, payload) =>
      instance
        .patch<ArticleManagement>(
          path(id),
          new UpdateArticleDto(payload),
          mutationConfig(accessToken, csrfToken),
        )
        .then(parseResponse(ArticleManagementDto)),
    updateHero: (accessToken, csrfToken, id, payload, hero, options = {}) =>
      instance
        .put<ArticleManagement>(
          `${path(id)}/hero`,
          heroFormData(new UpdateArticleHeroDto(payload), hero),
          uploadConfig(accessToken, csrfToken, options),
        )
        .then(parseResponse(ArticleManagementDto)),
    submit: (accessToken, csrfToken, id, payload) =>
      transition('submit', accessToken, csrfToken, id, payload),
    withdraw: (accessToken, csrfToken, id, payload) =>
      transition('withdraw', accessToken, csrfToken, id, payload),
  }
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
        mutationConfig(accessToken, csrfToken, options),
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
          mutationConfig(accessToken, csrfToken, options),
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
