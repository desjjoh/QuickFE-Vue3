import type { AxiosRequestConfig } from 'axios'
import { AxiosService, type IdempotencyOptions } from '@/shared/helpers/request'
import type { Paginated } from '@/library/models/pagination'
import {
  ArticleManagementDto,
  ArticleManagementPageDto,
  AuthoringArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
  UpdateArticleHeroDto,
  ArticleVersionDto,
  type ArticleManagement,
  type ArticleManagementListItem,
  type AuthoringArticleQuery,
  type CreateArticle,
  type UpdateArticle,
  type UpdateArticleHero,
  type ArticleVersion,
} from '@/library/models/articles'
import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig, idempotentRequestConfig } = AxiosService

export interface ArticleRoutes {
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

function mutationConfig(accessToken: string, csrfToken: string): AxiosRequestConfig {
  return requestConfig({ token: accessToken, csrfToken, withCredentials: true })
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

export function useArticleRoutes(): ArticleRoutes {
  const path = (id: string) => `articles/${encodeURIComponent(id)}`
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
        >('articles', requestConfig({ token: accessToken, params: { ...new AuthoringArticleQueryDto(query) } }))
        .then(({ data }) => new ArticleManagementPageDto(data)),
    find: (accessToken, id) =>
      instance
        .get<ArticleManagement>(path(id), requestConfig({ token: accessToken }))
        .then(parseResponse(ArticleManagementDto)),
    create: (accessToken, csrfToken, payload, hero, options = {}) =>
      instance
        .post<ArticleManagement>(
          'articles',
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
