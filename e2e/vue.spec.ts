import { test, expect } from '@playwright/test'
import { userFixture, auditFixture } from '../src/shared/api/__tests__/fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

test.beforeEach(async ({ page }) => {
  // Set QUICKAPI_E2E_LIVE=1 to use localhost reference data instead of fixtures.
  // These smoke tests never submit account mutations.
  if (process.env.QUICKAPI_E2E_LIVE !== '1') {
    const references: Record<string, unknown[]> = {
      countries: [userFixture.profile.region.country],
      genders: [userFixture.profile.personal.gender],
      roles: [],
      statuses: [userFixture.status],
      timezones: [userFixture.profile.region.timezone],
    }
    await page.route('**/api/v1/library/*', async (route) => {
      const name = new URL(route.request().url()).pathname.split('/').pop()!
      await route.fulfill({ json: references[name] ?? [] })
    })
  }
})

test('loads the public app shell and content', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByText('Top Stories', { exact: true })).toBeVisible()
  await expect(page.getByText('Must Watch', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /QuickFE/ })).toBeVisible()
  expect(errors).toEqual([])
})

test('opens the sign-in form with its accessible input fields', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('Email address', { exact: true })).toBeVisible()
  await expect(dialog.getByLabel('Password', { exact: true })).toBeVisible()
})

test('blocks guest access to account sessions without fetching protected data', async ({
  page,
}) => {
  const protectedRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/account/sessions')) protectedRequests.push(request.url())
  })
  await page.goto('/settings/sessions')
  await expect(page.getByRole('alert')).toContainText('You need to be signed in')
  expect(protectedRequests).toEqual([])
})

test('redirects the old activity bookmark to settings while preserving table query state', async ({
  page,
}) => {
  await page.goto('/profile/activity?page=2&take=25')
  await expect(page).toHaveURL(/\/settings\/activity\?page=2&take=25$/)
  await expect(page.getByRole('alert')).toContainText('You need to be signed in')
})

test('keeps the quick feed in profile and the full activity table in settings', async ({
  page,
}) => {
  const expires = Math.floor(Date.now() / 1000) + 3600
  await page.addInitScript(
    (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
    expires,
  )
  await page.route('**/api/v1/security/csrf', (route) =>
    route.fulfill({ json: { token: 'fixture-csrf', iat: expires - 3600, exp: expires } }),
  )
  await page.route('**/api/v1/authentication/refresh', (route) =>
    route.fulfill({
      json: {
        refresh: expires,
        access_token: 'fixture-access',
        iat: expires - 3600,
        exp: expires,
        user: userFixture,
      },
    }),
  )
  const takes: number[] = []
  await page.route('**/api/v1/account/activity?*', (route) => {
    const take = Number(new URL(route.request().url()).searchParams.get('take'))
    takes.push(take)
    const timestamp = new Date().toISOString()
    return route.fulfill({
      json: {
        data: [
          {
            id: `activity-${takes.length}`,
            domain: 'identity',
            event: 'identity.sign_in.succeeded',
            actorType: 'user',
            actorId: userFixture.id,
            actorUser: null,
            subjectType: 'user',
            subjectId: userFixture.id,
            resourceType: 'identity.user',
            resourceId: userFixture.id,
            occurredAt: timestamp,
            operationId: null,
            requestId: null,
            sessionId: null,
            ipAddress: null,
            ipLocation: {
              ip: null,
              countryCode: null,
              countryName: null,
              regionCode: null,
              regionName: null,
              city: null,
              source: 'unknown',
              resolvedAt: timestamp,
            },
            userAgent: null,
            browser: null,
            browserVersion: null,
            device: null,
            os: null,
            osVersion: null,
            httpMethod: null,
            route: null,
            source: 'http',
            before: null,
            after: null,
            changes: null,
            metadata: null,
            reasonCode: null,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
        meta: {
          page: 1,
          take,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    })
  })
  await page.route('**/api/v1/account/sessions', (route) => route.fulfill({ json: [] }))
  await page.goto('/profile/account')
  await expect(page.getByRole('link', { name: 'View all activity' })).toHaveAttribute(
    'href',
    '/settings/activity',
  )
  await expect(page.getByRole('tab', { name: 'Activity', exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'View all activity' }).click()
  await expect(page).toHaveURL(/\/settings\/activity$/)
  await expect(page.getByRole('tab', { name: 'Activity', exact: true })).toBeVisible()
  await expect(page.locator('tbody').getByText('Signed in', { exact: true })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Subject ID', exact: true })).toBeVisible()
  await expect(page.locator('tbody .badge').getByText('Identity', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Sessions', exact: true }).click()
  await expect(page).toHaveURL(/\/settings\/sessions$/)
  await page.getByRole('tab', { name: 'Activity', exact: true }).click()
  await expect(page.locator('tbody').getByText('Signed in', { exact: true })).toBeVisible()
  expect(takes).toEqual([5, 10, 10])
})

test('navigates administration sections and their nested tabs', async ({ page }) => {
  const expires = Math.floor(Date.now() / 1000) + 3600
  const timestamp = new Date().toISOString()
  const admin = {
    ...userFixture,
    roles: [
      {
        id: 'admin-role',
        createdAt: timestamp,
        updatedAt: timestamp,
        key: 'administrator',
        label: 'Administrator',
        description: null,
        permissions: ['has_all_permissions'],
      },
    ],
  }
  await page.addInitScript(
    (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
    expires,
  )
  await page.route('**/api/v1/security/csrf', (route) =>
    route.fulfill({ json: { token: 'fixture-csrf', iat: expires - 3600, exp: expires } }),
  )
  await page.route('**/api/v1/authentication/refresh', (route) =>
    route.fulfill({
      json: {
        refresh: expires,
        access_token: 'fixture-access',
        iat: expires - 3600,
        exp: expires,
        user: admin,
      },
    }),
  )
  const requests: string[] = []
  await page.route('**/api/v1/administration/**', (route) => {
    requests.push(new URL(route.request().url()).pathname)
    return route.fulfill({
      json: {
        data: route.request().url().includes('/administration/users')
          ? [
              {
                ...userFixture,
                version: 1,
                roles: [
                  { ...admin.roles[0], key: 'user', label: 'Untranslated user' },
                  { ...admin.roles[0], key: 'creator', label: 'Untranslated creator' },
                  { ...admin.roles[0], label: 'Untranslated administrator' },
                ],
                status: { ...userFixture.status, key: 'deleted', label: 'Untranslated deleted' },
              },
            ]
          : [],
        meta: {
          page: 1,
          take: 10,
          itemCount: route.request().url().includes('/administration/users') ? 1 : 0,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    })
  })
  await page.goto('/administration')
  await expect(page).toHaveURL(/\/administration\/overview\/dashboard$/)
  const nav = page.getByRole('navigation', { name: 'Administration navigation' })
  await expect(
    page.getByRole('heading', { name: 'Administration overview', exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Activity', exact: true }).click()
  await expect(page).toHaveURL(/\/administration\/overview\/activity$/)
  await expect(nav.getByRole('link', { name: 'Overview', exact: true })).toHaveClass(/is-active/)
  await expect(page.getByText('No platform activity found.', { exact: true })).toBeVisible()
  await expect(
    nav
      .getByRole('region', { name: 'Domains', exact: true })
      .getByRole('link', { name: 'Identity', exact: true }),
  ).toBeVisible()
  await expect(
    nav
      .getByRole('region', { name: 'General', exact: true })
      .getByRole('link', { name: 'Identity', exact: true }),
  ).toHaveCount(0)
  await nav.getByRole('link', { name: 'Identity', exact: true }).click()
  await expect(page).toHaveURL(/\/administration\/identity\/users$/)
  await expect(
    page.getByRole('heading', { name: 'Identity management', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Users', exact: true })).toBeVisible()
  await expect(
    page.locator('tbody .badge').getByText('Administrator', { exact: true }),
  ).toBeVisible()
  await expect(
    page.locator('tbody .badge.tone-danger').getByText('Deleted', { exact: true }),
  ).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Identity', exact: true })).toHaveClass(/is-active/)
  await nav.getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'Dashboard', exact: true })).toBeVisible()
  await expect(
    page.getByText('Platform metrics and summaries will appear here.', { exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Activity', exact: true }).click()
  await expect(page.getByText('No platform activity found.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible()
  await nav.getByRole('link', { name: 'Articles', exact: true }).click()
  await expect(page).toHaveURL(/\/administration\/articles$/)
  await expect(page.getByRole('heading', { name: 'Article Management', exact: true })).toBeVisible()
  await expect(
    page.getByText('Article review and lifecycle management will be available here.', {
      exact: true,
    }),
  ).toBeVisible()
  expect(requests).toEqual([
    '/api/v1/administration/audits',
    '/api/v1/administration/users',
    '/api/v1/administration/audits',
  ])
})

test.describe('administration audit details', () => {
  test.beforeEach(async ({ page }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600
    const timestamp = new Date().toISOString()
    const role = {
      id: 'admin-role',
      createdAt: timestamp,
      updatedAt: timestamp,
      key: 'administrator',
      label: 'Administrator',
      description: null,
      permissions: ['search_audit', 'read_audit_detail'],
    }
    await page.addInitScript(
      (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
      expires,
    )
    await page.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'fixture-csrf', iat: expires - 3600, exp: expires } }),
    )
    await page.route('**/api/v1/authentication/refresh', (route) =>
      route.fulfill({
        json: {
          refresh: expires,
          access_token: 'fixture-access',
          iat: expires - 3600,
          exp: expires,
          user: { ...userFixture, roles: [role] },
        },
      }),
    )
    await page.route('**/api/v1/administration/audits?*', (route) =>
      route.fulfill({
        json: {
          data: [auditFixture],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        },
      }),
    )
  })

  test('retries details, displays payloads, and closes on page navigation', async ({ page }) => {
    let calls = 0
    await page.route('**/api/v1/administration/audits/audit-example', (route) => {
      calls += 1
      return calls === 1
        ? route.fulfill({ status: 500, json: { message: 'temporary failure' } })
        : route.fulfill({ json: auditFixture })
    })
    await page.goto('/administration/overview/dashboard')
    await page.getByRole('tab', { name: 'Activity', exact: true }).click()
    await page.getByRole('button', { name: 'View audit details', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('alert')).toContainText('Unable to load audit details')
    await dialog.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(dialog.getByText('request-example', { exact: true })).toBeVisible()
    await expect(dialog.getByText('operation-example', { exact: true })).toBeVisible()
    await expect(dialog.locator('code')).toContainText('before: Before')
    await dialog.getByRole('button', { name: 'Before', exact: true }).click()
    await expect(dialog.locator('code')).toContainText('name: Before')
    await dialog.getByRole('button', { name: 'After', exact: true }).click()
    await expect(dialog.locator('code')).toContainText('name: After')
    await dialog.getByRole('button', { name: 'Metadata', exact: true }).click()
    await expect(dialog.getByText('No data recorded.', { exact: true })).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(/\/administration\/overview\/dashboard$/)
    await expect(dialog).toHaveCount(0)
    expect(calls).toBe(2)
  })

  test('shows unavailable records and supports closing with Escape', async ({ page }) => {
    await page.route('**/api/v1/administration/audits/audit-example', (route) =>
      route.fulfill({ status: 404, json: { message: 'not found' } }),
    )
    await page.goto('/administration/overview/activity')
    await page.getByRole('button', { name: 'View audit details', exact: true }).click()
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
      'This audit record is no longer available.',
    )
    await expect(
      page.getByRole('dialog').getByRole('button', { name: 'Retry', exact: true }),
    ).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('hides detail actions for administrators with search permission only', async ({ page }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600
    const timestamp = new Date().toISOString()
    await page.route('**/api/v1/authentication/refresh', (route) =>
      route.fulfill({
        json: {
          refresh: expires,
          access_token: 'fixture-access',
          iat: expires - 3600,
          exp: expires,
          user: {
            ...userFixture,
            roles: [
              {
                id: 'search-role',
                createdAt: timestamp,
                updatedAt: timestamp,
                key: 'administrator',
                label: 'Administrator',
                description: null,
                permissions: ['search_audit'],
              },
            ],
          },
        },
      }),
    )
    await page.goto('/administration/overview/activity')
    await expect(page.locator('tbody').getByText('Signed in', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'View audit details', exact: true })).toHaveCount(
      0,
    )
  })
})
