import type { RouteLocationRaw } from 'vue-router'
import { BaseDto, type iBase } from './base'

export type HomeLink = string | RouteLocationRaw

export interface iArticleSummary extends iBase {
  title: string
  description: string

  image: string
  imageAlt: string

  slug: string
  href: HomeLink

  publishedAt: Date
}

export interface iFeaturedArticle extends iArticleSummary {
  kicker: string
}

export class ArticleSummary extends BaseDto {
  public readonly title: string
  public readonly description: string

  public readonly image: string
  public readonly imageAlt: string

  public readonly slug: string
  public readonly href: HomeLink

  public readonly publishedAt: Date

  constructor(payload: iArticleSummary) {
    super(payload)

    this.title = payload.title
    this.description = payload.description

    this.image = payload.image
    this.imageAlt = payload.imageAlt

    this.slug = payload.slug
    this.href = payload.href

    this.publishedAt = new Date(payload.publishedAt)
  }
}

export class FeaturedArticle extends ArticleSummary {
  public readonly kicker: string

  constructor(payload: iFeaturedArticle) {
    super(payload)

    this.kicker = payload.kicker
  }
}

export interface iVideoSummary {
  id: string
  title: string
  image: string
  imageAlt: string
  href: string
  published: string
  durationSeconds: number
}

export interface iHomeContent {
  featuredArticle: iFeaturedArticle
  secondaryArticles: iArticleSummary[]
  headlines: iArticleSummary[]
  videos: iVideoSummary[]
}
