import { BaseDto, type iBase } from './base'
import { PaginatedDto, type Paginated, type SortOrder } from './pagination'
import type { AdministrationReasonCode } from './administration'

export type ArticleStatusKey = 'draft' | 'submitted' | 'published' | 'archived'

export interface ArticleImage {
  id: string
  url: string
  width: number
  height: number
  altText: string | null
  decorative: boolean
}

export class ArticleImageDto implements ArticleImage {
  public readonly id: string
  public readonly url: string
  public readonly width: number
  public readonly height: number
  public readonly altText: string | null
  public readonly decorative: boolean

  public constructor(payload: ArticleImage) {
    this.id = payload.id
    this.url = payload.url
    this.width = payload.width
    this.height = payload.height
    this.altText = payload.altText
    this.decorative = payload.decorative
  }
}

export interface ArticleAuthor {
  id: string
  displayName: string
  avatar: ArticleImage | null
}

export class ArticleAuthorDto {
  public readonly id: string
  public readonly displayName: string
  public readonly avatar: ArticleImageDto | null

  public constructor(payload: ArticleAuthor) {
    this.id = payload.id
    this.displayName = payload.displayName
    this.avatar = payload.avatar ? new ArticleImageDto(payload.avatar) : null
  }
}

export interface ArticleStatus {
  key: ArticleStatusKey
  label: string
}

export class ArticleStatusDto implements ArticleStatus {
  public readonly key: ArticleStatusKey
  public readonly label: string

  public constructor(payload: ArticleStatus) {
    this.key = payload.key
    this.label = payload.label
  }
}

export interface ArticleListItem extends iBase {
  title: string
  summary: string
  hero: ArticleImage
  author: ArticleAuthor | null
  status: ArticleStatus
  publishedAt: string | null
}

export class ArticleListItemDto extends BaseDto {
  public readonly title: string
  public readonly summary: string
  public readonly hero: ArticleImageDto
  public readonly author: ArticleAuthorDto | null
  public readonly status: ArticleStatusDto
  public readonly publishedAt: Date | null

  public constructor(payload: ArticleListItem) {
    super(payload)
    this.title = payload.title
    this.summary = payload.summary
    this.hero = new ArticleImageDto(payload.hero)
    this.author = payload.author ? new ArticleAuthorDto(payload.author) : null
    this.status = new ArticleStatusDto(payload.status)
    this.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : null
  }
}

export interface Article extends ArticleListItem {
  body: string
  publisher: ArticleAuthor | null
}

export class ArticleDto extends ArticleListItemDto {
  public readonly body: string
  public readonly publisher: ArticleAuthorDto | null

  public constructor(payload: Article) {
    super(payload)
    this.body = payload.body
    this.publisher = payload.publisher ? new ArticleAuthorDto(payload.publisher) : null
  }
}

export interface ArticleManagementListItem extends ArticleListItem {
  version: number
}
export interface ArticleManagement extends Article {
  version: number
}

export class ArticleManagementListItemDto extends ArticleListItemDto {
  public readonly version: number

  public constructor(payload: ArticleManagementListItem) {
    super(payload)
    this.version = payload.version
  }
}

export class ArticleManagementDto extends ArticleDto {
  public readonly version: number

  public constructor(payload: ArticleManagement) {
    super(payload)
    this.version = payload.version
  }
}

export class ArticlePageDto extends PaginatedDto<ArticleListItemDto, ArticleListItem> {
  public constructor(payload: Paginated<ArticleListItem>) {
    super(payload, ArticleListItemDto)
  }
}

export class ArticleManagementPageDto extends PaginatedDto<
  ArticleManagementListItemDto,
  ArticleManagementListItem
> {
  public constructor(payload: Paginated<ArticleManagementListItem>) {
    super(payload, ArticleManagementListItemDto)
  }
}

export interface PublicArticleQuery {
  search?: string
  order?: SortOrder
  page?: number
  take?: number
}

export class PublicArticleQueryDto implements PublicArticleQuery {
  public readonly search: string
  public readonly order: SortOrder
  public readonly page: number
  public readonly take: number

  public constructor(payload: PublicArticleQuery = {}) {
    this.search = payload.search ?? ''
    this.order = payload.order ?? 'DESC'
    this.page = payload.page ?? 1
    this.take = payload.take ?? 25
  }
}

export interface AuthoringArticleQuery extends PublicArticleQuery {
  statusKey?: ArticleStatusKey
}
export class AuthoringArticleQueryDto extends PublicArticleQueryDto {
  public readonly statusKey?: ArticleStatusKey

  public constructor(payload: AuthoringArticleQuery = {}) {
    super(payload)
    this.statusKey = payload.statusKey
  }
}

export interface AdministrationArticleQuery extends AuthoringArticleQuery {
  authorId?: string
}
export class AdministrationArticleQueryDto extends AuthoringArticleQueryDto {
  public readonly authorId?: string

  public constructor(payload: AdministrationArticleQuery = {}) {
    super(payload)
    this.authorId = payload.authorId
  }
}

export interface ArticleVersion {
  expected_version: number
}
export class ArticleVersionDto implements ArticleVersion {
  public readonly expected_version: number

  public constructor(payload: ArticleVersion) {
    this.expected_version = payload.expected_version
  }
}

/** Every new hero requires a fresh informative or decorative choice. */
export type HeroAccessibility =
  | { hero_alt_text: string; hero_decorative?: false }
  | { hero_decorative: true; hero_alt_text?: null }

export class HeroAccessibilityDto {
  public readonly hero_alt_text?: string | null
  public readonly hero_decorative: boolean

  public constructor(payload: HeroAccessibility) {
    this.hero_alt_text = payload.hero_alt_text
    this.hero_decorative = payload.hero_decorative ?? false
  }
}

export type CreateArticle = HeroAccessibility & { title: string; summary: string; body: string }
export class CreateArticleDto extends HeroAccessibilityDto {
  public readonly title: string
  public readonly summary: string
  public readonly body: string

  public constructor(payload: CreateArticle) {
    super(payload)
    this.title = payload.title
    this.summary = payload.summary
    this.body = payload.body
  }
}

export interface UpdateArticle extends ArticleVersion {
  title?: string
  summary?: string
  body?: string
}
export class UpdateArticleDto extends ArticleVersionDto {
  public readonly title?: string
  public readonly summary?: string
  public readonly body?: string

  public constructor(payload: UpdateArticle) {
    super(payload)
    this.title = payload.title
    this.summary = payload.summary
    this.body = payload.body
  }
}

export type UpdateArticleHero = HeroAccessibility & ArticleVersion
export class UpdateArticleHeroDto extends HeroAccessibilityDto {
  public readonly expected_version: number

  public constructor(payload: UpdateArticleHero) {
    super(payload)
    this.expected_version = payload.expected_version
  }
}

export interface ArticleAdministrationAction extends ArticleVersion {
  reason_code: AdministrationReasonCode
}
export class ArticleAdministrationActionDto extends ArticleVersionDto {
  public readonly reason_code: AdministrationReasonCode

  public constructor(payload: ArticleAdministrationAction) {
    super(payload)
    this.reason_code = payload.reason_code
  }
}
