import type { Paginated } from '@/library/models/pagination'
import {
  ArticleDto,
  ArticlePageDto,
  PublicArticleQueryDto,
  type Article,
  type ArticleListItem,
  type PublicArticleQuery,
} from '@/library/models/articles'
import { AxiosService } from '@/shared/helpers/request'
import {
  AccountStatusDto,
  CountryDto,
  GenderDto,
  RoleDto,
  TimezoneDto,
  type iCountry,
  type iGender,
  type iRole,
  type iStatus,
  type iTimezone,
} from '@/library/models/reference'

import { instance } from '../useLocalhostAPI'

const { parseArrayResponse, parseResponse, requestConfig } = AxiosService

export interface PublicLibraryRoutes {
  getCountries: () => Promise<CountryDto[]>
  getGenders: () => Promise<GenderDto[]>
  getRoles: () => Promise<RoleDto[]>
  getStatuses: () => Promise<AccountStatusDto[]>
  getTimezones: () => Promise<TimezoneDto[]>
}

export interface PublicArticleRoutes {
  list: (query?: PublicArticleQuery) => Promise<ArticlePageDto>
  find: (id: string) => Promise<ArticleDto>
}

export interface PublicRoutes {
  library: PublicLibraryRoutes
  articles: PublicArticleRoutes
}

export function usePublicRoutes(): PublicRoutes {
  return { library: usePublicLibraryRoutes(), articles: usePublicArticleRoutes() }
}

export function usePublicLibraryRoutes(): PublicLibraryRoutes {
  async function getCountries(): Promise<CountryDto[]> {
    return instance.get<iCountry[]>('public/library/countries').then(parseArrayResponse(CountryDto))
  }

  async function getGenders(): Promise<GenderDto[]> {
    return instance.get<iGender[]>('public/library/genders').then(parseArrayResponse(GenderDto))
  }

  async function getRoles(): Promise<RoleDto[]> {
    return instance.get<iRole[]>('public/library/roles').then(parseArrayResponse(RoleDto))
  }

  async function getStatuses(): Promise<AccountStatusDto[]> {
    return instance
      .get<iStatus[]>('public/library/statuses')
      .then(parseArrayResponse(AccountStatusDto))
  }

  async function getTimezones(): Promise<TimezoneDto[]> {
    return instance
      .get<iTimezone[]>('public/library/timezones')
      .then(parseArrayResponse(TimezoneDto))
  }

  return {
    getCountries,
    getGenders,
    getRoles,
    getStatuses,
    getTimezones,
  }
}

export function usePublicArticleRoutes(): PublicArticleRoutes {
  return {
    list: (query = {}) =>
      instance
        .get<
          Paginated<ArticleListItem>
        >('public/articles', requestConfig({ params: { ...new PublicArticleQueryDto(query) } }))
        .then(({ data }) => new ArticlePageDto(data)),
    find: (id) =>
      instance
        .get<Article>(`public/articles/${encodeURIComponent(id)}`)
        .then(parseResponse(ArticleDto)),
  }
}
