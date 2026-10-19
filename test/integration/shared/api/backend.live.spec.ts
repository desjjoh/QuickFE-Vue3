import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Agent } from 'node:https'
import { instance, useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { ArticlePageDto } from '@/library/models/articles'
import { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference'
import { CsrfTokenDto } from '@/library/models/token'

interface Schema {
  $ref?: string
  required?: string[]
  properties?: Record<string, Schema>
  allOf?: Schema[]
}
interface ApiDocument {
  paths: Record<string, Record<string, unknown>>
  components: { schemas: Record<string, Schema> }
}
const configuredBase = process.env.QUICKAPI_LIVE_BASE_URL ?? 'https://localhost:4000/api/v1'
const base = new URL(configuredBase)
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) {
  throw new Error('Live verification is restricted to a local QuickAPI instance.')
}
const original = { baseURL: instance.defaults.baseURL, httpsAgent: instance.defaults.httpsAgent }
let schema: ApiDocument

beforeAll(async () => {
  instance.defaults.baseURL = configuredBase
  // Local development certificates only; never change global TLS settings.
  instance.defaults.httpsAgent = new Agent({ rejectUnauthorized: false })
  schema = (await instance.get<ApiDocument>(new URL('/docs-json', base).href)).data
})
afterAll(() => {
  instance.defaults.httpsAgent.destroy()
  instance.defaults.baseURL = original.baseURL
  instance.defaults.httpsAgent = original.httpsAgent
})

describe('running QuickAPI: read-only integration', () => {
  it('reports readiness and serves the current API schema', async () => {
    const health = await instance.get(new URL('/health', base).href)
    expect(health.data.alive).toBe(true)
    const ready = await instance.get(new URL('/ready', base).href)
    expect(ready.data.ready).toBe(true)
    expect(schema.paths).toHaveProperty('/api/v1/public/articles')
  })

  it('hydrates the live public article collection', async () => {
    const result = await useLocalHostAPI().public.articles.list({ page: 1, take: 1 })
    expect(result).toBeInstanceOf(ArticlePageDto)
    expect(result.meta.page).toBe(1)
    expect(result.meta.take).toBe(1)
    for (const item of result.data) {
      expect(item.status.key).toBe('published')
      expect(item.createdAt).toBeInstanceOf(Date)
      const detail = await useLocalHostAPI().public.articles.find(item.id)
      expect(detail.id).toBe(item.id)
      expect(typeof detail.body).toBe('string')
    }
  })

  it('hydrates the reference data consumed by existing profile forms', async () => {
    const library = useLocalHostAPI().public.library
    const [countries, genders, timezones] = await Promise.all([
      library.getCountries(),
      library.getGenders(),
      library.getTimezones(),
    ])
    expect(countries.length).toBeGreaterThan(0)
    expect(countries[0]).toBeInstanceOf(CountryDto)
    expect(genders[0]).toBeInstanceOf(GenderDto)
    expect(timezones[0]).toBeInstanceOf(TimezoneDto)
    expect(countries[0]?.createdAt).toBeInstanceOf(Date)
  })

  it('retrieves the live CSRF contract without exposing the token', async () => {
    const result = await useLocalHostAPI().security.csrfToken()
    expect(result).toBeInstanceOf(CsrfTokenDto)
    expect(typeof result.token).toBe('string')
    expect(result.exp).toBeGreaterThan(result.iat)
  })

  it.each(['articles', 'administration/users', 'administration/audits', 'administration/articles'])(
    'rejects unauthenticated access to %s',
    async (path) => {
      await expect(instance.get(path)).rejects.toMatchObject({ response: { status: 401 } })
    },
  )

  it.each([
    ['get', '/api/v1/public/library/countries'],
    ['get', '/api/v1/public/library/genders'],
    ['get', '/api/v1/public/library/roles'],
    ['get', '/api/v1/public/library/statuses'],
    ['get', '/api/v1/public/library/timezones'],
    ['get', '/api/v1/public/articles'],
    ['get', '/api/v1/public/articles/{id}'],
    ['get', '/api/v1/articles'],
    ['get', '/api/v1/articles/{id}'],
    ['post', '/api/v1/articles'],
    ['patch', '/api/v1/articles/{id}'],
    ['put', '/api/v1/articles/{id}/hero'],
    ['post', '/api/v1/articles/{id}/submit'],
    ['post', '/api/v1/articles/{id}/withdraw'],
    ['get', '/api/v1/administration/articles'],
    ['get', '/api/v1/administration/articles/{id}'],
    ['post', '/api/v1/administration/articles/{id}/publish'],
    ['post', '/api/v1/administration/articles/{id}/return-to-draft'],
    ['post', '/api/v1/administration/articles/{id}/archive'],
    ['post', '/api/v1/administration/articles/{id}/restore'],
    ['delete', '/api/v1/account/sessions'],
  ])('matches the running backend route: %s %s', (method, path) => {
    expect(schema.paths[path]?.[method]).toBeDefined()
  })

  it('matches version and actor-user fields in the running backend DTOs', () => {
    expect(schema.components.schemas.UserAdministrationDto?.properties).toHaveProperty('version')
    expect(schema.components.schemas.AuditEventDto?.properties).toHaveProperty('actorUser')
    expect(schema.components.schemas.SessionDto?.properties).toHaveProperty('active')
    expect(schema.components.schemas.ArticleManagementDto?.properties).toHaveProperty('version')
  })
})
