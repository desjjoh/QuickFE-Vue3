import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { instance, useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import {
  ArticleAuthorDto,
  ArticleDto,
  ArticleImageDto,
  ArticleListItemDto,
  ArticleManagementDto,
  ArticleManagementListItemDto,
  ArticleStatusDto,
  type ArticleManagement,
} from '@/library/models/articles'

const timestamp = '2026-10-12T12:00:00.000Z'
const hero = {
  id: 'image',
  url: 'https://example.test/hero.png',
  width: 1600,
  height: 900,
  altText: null,
  decorative: false,
}
const article: ArticleManagement = {
  id: 'abcdefghijklmnop',
  createdAt: timestamp,
  updatedAt: timestamp,
  title: 'Title',
  summary: 'Summary',
  body: 'Article body',
  hero,
  author: { id: 'author', displayName: 'Author', avatar: hero },
  publisher: null,
  status: { key: 'draft', label: 'Draft' },
  publishedAt: null,
  version: 7,
}
const meta = {
  page: 1,
  take: 25,
  itemCount: 1,
  pageCount: 1,
  hasPreviousPage: false,
  hasNextPage: false,
}
const file = new File(['image bytes'], 'hero.png', { type: 'image/png' })
const originalAdapter = instance.defaults.adapter
const requests: InternalAxiosRequestConfig[] = []
let responseData: unknown
const adapter = vi.fn<AxiosAdapter>(async (config) => {
  requests.push(config)
  return { data: responseData, status: 200, statusText: 'OK', headers: {}, config }
})
beforeEach(() => {
  requests.length = 0
  adapter.mockClear()
  responseData = article
  instance.defaults.adapter = adapter
})
afterEach(() => {
  instance.defaults.adapter = originalAdapter
})

describe('public article contracts', () => {
  it('lists compact public DTOs with pagination and no private query fields or authentication', async () => {
    responseData = { data: [article], meta }
    const result = await useLocalHostAPI().public.articles.list({
      search: '100% _!',
      order: 'ASC',
      page: 2,
      take: 10,
      ...{ statusKey: 'draft', authorId: 'other' },
    })
    expect(requests[0]).toMatchObject({
      method: 'get',
      url: 'public/articles',
      params: { search: '100% _!', order: 'ASC', page: 2, take: 10 },
    })
    expect(requests[0]!.params).not.toHaveProperty('statusKey')
    expect(requests[0]!.params).not.toHaveProperty('authorId')
    expect(requests[0]!.headers.has('Authorization')).toBe(false)
    expect(requests[0]!.headers.has('X-CSRF-Token')).toBe(false)
    expect(requests[0]!.headers.has('Idempotency-Key')).toBe(false)
    expect(result.data[0]).toBeInstanceOf(ArticleListItemDto)
    expect(result.data[0]).not.toHaveProperty('body')
    expect(result.data[0]).not.toHaveProperty('version')
    expect(result.meta.itemCount).toBe(1)
  })

  it('hydrates nested images, authors, publishers and dates without making a legacy hero decorative', async () => {
    responseData = {
      ...article,
      status: { key: 'published', label: 'Published' },
      publishedAt: timestamp,
      publisher: article.author,
    }
    const result = await useLocalHostAPI().public.articles.find('article/id')
    expect(requests[0]!.url).toBe('public/articles/article%2Fid')
    expect(result).toBeInstanceOf(ArticleDto)
    expect(result.hero).toBeInstanceOf(ArticleImageDto)
    expect(result.author).toBeInstanceOf(ArticleAuthorDto)
    expect(result.author?.avatar).toBeInstanceOf(ArticleImageDto)
    expect(result.publisher).toBeInstanceOf(ArticleAuthorDto)
    expect(result.status).toBeInstanceOf(ArticleStatusDto)
    expect(result.publishedAt?.toISOString()).toBe(timestamp)
    expect(result.createdAt.toISOString()).toBe(timestamp)
    expect(result.hero.altText).toBeNull()
    expect(result.hero.decorative).toBe(false)
    expect(result).not.toHaveProperty('version')
    responseData = { ...article, author: null }
    expect((await useLocalHostAPI().public.articles.find(article.id)).author).toBeNull()
  })
})

describe('article authoring contracts', () => {
  it('lists and reads management models with status filtering and current revisions', async () => {
    responseData = { data: [article], meta }
    const result = await useLocalHostAPI().articles.list('access', {
      statusKey: 'submitted',
    })
    expect(requests[0]).toMatchObject({
      url: 'articles',
      params: { statusKey: 'submitted', order: 'DESC', page: 1, take: 25 },
    })
    expect(requests[0]!.headers.get('Authorization')).toBe('Bearer access')
    expect(result.data[0]).toBeInstanceOf(ArticleManagementListItemDto)
    expect(result.data[0]?.version).toBe(7)
    expect(result.data[0]).not.toHaveProperty('body')
    responseData = article
    expect(await useLocalHostAPI().articles.find('access', article.id)).toBeInstanceOf(
      ArticleManagementDto,
    )
    expect(requests[1]!.url).toBe(`articles/${article.id}`)
  })

  it('creates an informative hero with exact multipart fields and a caller-owned replay key', async () => {
    const result = await useLocalHostAPI().articles.create(
      'access',
      'csrf',
      { title: 'Title', summary: 'Summary', body: 'Body', hero_alt_text: 'A scene' },
      file,
      { idempotencyKey: 'create-article' },
    )
    const request = requests[0]!
    expect(request).toMatchObject({
      method: 'post',
      url: 'articles',
      timeout: 90_000,
      withCredentials: true,
    })
    expect(request.data).toBeInstanceOf(FormData)
    expect(Object.fromEntries(request.data.entries())).toEqual({
      hero: file,
      title: 'Title',
      summary: 'Summary',
      body: 'Body',
      hero_alt_text: 'A scene',
      hero_decorative: 'false',
    })
    expect(request.headers.get('Content-Type')).toBe('multipart/form-data')
    expect(request.headers.get('Authorization')).toBe('Bearer access')
    expect(request.headers.get('X-CSRF-Token')).toBe('csrf')
    expect(request.headers.get('Idempotency-Key')).toBe('create-article')
    expect(result.version).toBe(7)
  })

  it('replaces a hero with a fresh decorative choice and serializes the version as decimal text', async () => {
    await useLocalHostAPI().articles.updateHero(
      'access',
      'csrf',
      article.id,
      { expected_version: 7, hero_decorative: true, hero_alt_text: null },
      file,
      { idempotencyKey: 'hero-replace' },
    )
    const request = requests[0]!
    expect(request).toMatchObject({
      method: 'put',
      url: `articles/${article.id}/hero`,
      timeout: 90_000,
    })
    expect(Object.fromEntries(request.data.entries())).toEqual({
      hero: file,
      expected_version: '7',
      hero_decorative: 'true',
    })
    expect(request.data.has('hero_alt_text')).toBe(false)
    expect(request.headers.get('Idempotency-Key')).toBe('hero-replace')
  })

  it('edits only supplied content fields and retains the expected version', async () => {
    await useLocalHostAPI().articles.update('access', 'csrf', article.id, {
      expected_version: 7,
      title: 'New title',
    })
    expect(requests[0]).toMatchObject({ method: 'patch', url: `articles/${article.id}` })
    expect(JSON.parse(requests[0]!.data)).toEqual({ expected_version: 7, title: 'New title' })
    expect(requests[0]!.headers.has('Idempotency-Key')).toBe(false)
  })

  it.each(['submit', 'withdraw'] as const)(
    'uses the version precondition for %s without an unsupported key',
    async (action) => {
      await useLocalHostAPI().articles[action]('access', 'csrf', article.id, {
        expected_version: 7,
      })
      expect(requests[0]).toMatchObject({
        method: 'post',
        url: `articles/${article.id}/${action}`,
        withCredentials: true,
      })
      expect(JSON.parse(requests[0]!.data)).toEqual({ expected_version: 7 })
      expect(requests[0]!.headers.get('X-CSRF-Token')).toBe('csrf')
      expect(requests[0]!.headers.has('Idempotency-Key')).toBe(false)
    },
  )
})

describe('article administration contracts', () => {
  it('lists review items with author/status filters and reads complete management detail', async () => {
    responseData = { data: [article], meta }
    const result = await useLocalHostAPI().administration.articles.list('access', {
      authorId: 'author',
      statusKey: 'archived',
      search: 'Title',
    })
    expect(requests[0]).toMatchObject({
      url: 'administration/articles',
      params: { authorId: 'author', statusKey: 'archived', search: 'Title' },
    })
    expect(result.data[0]).toBeInstanceOf(ArticleManagementListItemDto)
    responseData = article
    const detail = await useLocalHostAPI().administration.articles.find('access', article.id)
    expect(requests[1]!.url).toBe(`administration/articles/${article.id}`)
    expect(detail.body).toBe('Article body')
    expect(detail.version).toBe(7)
  })

  it('publishes with a version and an automatically generated idempotency key', async () => {
    await useLocalHostAPI().administration.articles.publish('access', 'csrf', article.id, {
      expected_version: 7,
    })
    expect(requests[0]!.url).toBe(`administration/articles/${article.id}/publish`)
    expect(JSON.parse(requests[0]!.data)).toEqual({ expected_version: 7 })
    expect(requests[0]!.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/)
    expect(requests[0]!.headers.get('X-CSRF-Token')).toBe('csrf')
  })

  it.each(['archive', 'restore'] as const)(
    'sends a controlled reason, version and supplied key for %s',
    async (action) => {
      await useLocalHostAPI().administration.articles[action](
        'access',
        'csrf',
        article.id,
        { expected_version: 7, reason_code: 'policy_enforcement' },
        { idempotencyKey: action },
      )
      expect(requests[0]).toMatchObject({
        method: 'post',
        url: `administration/articles/${article.id}/${action}`,
      })
      expect(JSON.parse(requests[0]!.data)).toEqual({
        expected_version: 7,
        reason_code: 'policy_enforcement',
      })
      expect(requests[0]!.headers.get('Idempotency-Key')).toBe(action)
    },
  )

  it('returns submissions to draft with a reason and no unsupported idempotency header', async () => {
    await useLocalHostAPI().administration.articles.returnToDraft('access', 'csrf', article.id, {
      expected_version: 7,
      reason_code: 'data_correction',
    })
    expect(requests[0]!.url).toBe(`administration/articles/${article.id}/return-to-draft`)
    expect(JSON.parse(requests[0]!.data)).toEqual({
      expected_version: 7,
      reason_code: 'data_correction',
    })
    expect(requests[0]!.headers.has('Idempotency-Key')).toBe(false)
  })

  it.each([404, 409, 422, 503])(
    'preserves HTTP %s failures without retrying or changing version',
    async (status) => {
      const failure = new AxiosError('Rejected', 'ERR_BAD_REQUEST')
      failure.response = {
        data: { message: 'Rejected' },
        status,
        statusText: 'Rejected',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      adapter.mockRejectedValueOnce(failure)
      await expect(
        useLocalHostAPI().administration.articles.publish('access', 'csrf', article.id, {
          expected_version: 7,
        }),
      ).rejects.toBe(failure)
      expect(adapter).toHaveBeenCalledTimes(1)
    },
  )
})
