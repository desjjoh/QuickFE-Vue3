import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Agent } from 'node:https'
import { instance, useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference'
import { CsrfTokenDto } from '@/library/models/token'

interface Schema {
  $ref?: string
  required?: string[]
  properties?: Record<string, Schema>
  allOf?: Schema[]
}
interface ApiDocument {
  paths: Record<string, Record<string, { parameters?: { in: string; name: string }[] }>>
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
  })

  it('hydrates the reference data consumed by existing profile forms', async () => {
    const { countries, genders, timezones } = await useLocalHostAPI().public.library.getStartup()
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

  it.each(['administration/users', 'administration/audits'])(
    'rejects unauthenticated access to %s',
    async (path) => {
      await expect(instance.get(path)).rejects.toMatchObject({ response: { status: 401 } })
    },
  )

  it.each([
    ['get', '/api/v1/public/library/startup'],
    ['get', '/api/v1/public/library/countries'],
    ['get', '/api/v1/public/library/genders'],
    ['get', '/api/v1/public/library/timezones'],
    ['get', '/api/v1/security/csrf'],
    ['post', '/api/v1/authentication/refresh'],
    ['get', '/api/v1/account/activity'],
    ['get', '/api/v1/account/sessions'],
    ['delete', '/api/v1/account/sessions'],
    ['delete', '/api/v1/account/sessions/{id}'],
  ])('matches the running backend route: %s %s', (method, path) => {
    expect(schema.paths[path]?.[method]).toBeDefined()
  })

  it.each([
    ['patch', '/api/v1/account/profile'],
    ['put', '/api/v1/account/profile/country'],
    ['put', '/api/v1/account/profile/timezone'],
  ])('advertises idempotency for %s %s', (method, path) => {
    expect(schema.paths[path]?.[method]?.parameters).toEqual(
      expect.arrayContaining([expect.objectContaining({ in: 'header', name: 'Idempotency-Key' })]),
    )
  })

  it('matches version and actor-user fields in the running backend DTOs', () => {
    expect(schema.components.schemas.UserAdministrationDto?.properties).toHaveProperty('version')
    expect(schema.components.schemas.AuditEventDto?.properties).toHaveProperty('actorUser')
    expect(schema.components.schemas.SessionDto?.properties).toHaveProperty('active')
  })
})
