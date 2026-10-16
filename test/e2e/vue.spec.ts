import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'
import { userFixture, auditFixture } from '@test/support/api-fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

async function verifyStickyPrimaryColumn(page: Page, selectable: boolean) {
  const result = await page.locator('.data-table__scroll').evaluate(async (element) => {
    const scroller = element as HTMLElement
    const header = scroller.querySelector<HTMLElement>('thead .data-table__primary-column')!
    const cell = scroller.querySelector<HTMLElement>('tbody .data-table__primary-column')!
    const other = cell.nextElementSibling as HTMLElement
    const originalWidth = scroller.style.width
    scroller.style.width = '520px'
    // Allow resize observation and its scheduled shadow update to complete.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
    const before = {
      header: header.offsetLeft,
      cell: cell.getBoundingClientRect().left,
      other: other.getBoundingClientRect().left,
    }
    const maximum = scroller.scrollWidth - scroller.clientWidth
    scroller.scrollLeft = maximum
    scroller.dispatchEvent(new Event('scroll'))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const after = {
      header: header.getBoundingClientRect().left,
      cell: cell.getBoundingClientRect().left,
      other: other.getBoundingClientRect().left,
    }
    const bounds = scroller.getBoundingClientRect()
    const index = Array.from(cell.parentElement!.children).indexOf(cell)
    const opaque = getComputedStyle(cell).backgroundColor !== 'rgba(0, 0, 0, 0)'
    const divider = getComputedStyle(cell).boxShadow
    const shadow = getComputedStyle(scroller.querySelector('.data-table__edges')!, '::before')
    const shadowLeft = Number.parseFloat(shadow.left)
    const shadowOpacity = Number.parseFloat(shadow.opacity)
    const viewportShadowHeight = Number.parseFloat(
      getComputedStyle(scroller.querySelector('.data-table__edges')!, '::after').height,
    )
    const tableHeight = scroller.querySelector('table')!.getBoundingClientRect().height
    const cellWidth = cell.getBoundingClientRect().width
    scroller.style.width = `${scroller.scrollWidth + 1}px`
    scroller.dispatchEvent(new Event('scroll'))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const fitsDivider = getComputedStyle(cell).boxShadow
    scroller.scrollLeft = 0
    scroller.style.width = originalWidth
    return {
      before,
      after,
      maximum,
      left: bounds.left,
      index,
      opaque,
      divider,
      shadowLeft,
      shadowOpacity,
      cellWidth,
      fitsDivider,
      viewportShadowHeight,
      tableHeight,
      shadowMask: shadow.maskImage,
      edgeLeft: scroller.querySelector('.data-table__edges')!.getBoundingClientRect().left,
    }
  })
  expect(result.maximum).toBeGreaterThan(0)
  expect(result.index).toBe(selectable ? 1 : 0)
  expect(result.after.header).toBeCloseTo(result.left, 0)
  expect(result.after.cell).toBeCloseTo(result.left, 0)
  expect(result.after.other).toBeLessThan(result.before.other)
  expect(result.opaque).toBe(true)
  expect(result.divider).toBe('none')
  expect(result.shadowLeft).toBeCloseTo(result.cellWidth, 0)
  expect(result.shadowOpacity).toBeGreaterThan(0)
  expect(result.fitsDivider).toBe('none')
  expect(result.viewportShadowHeight).toBeCloseTo(result.tableHeight, 0)
  expect(result.shadowMask).toBe('none')
  expect(result.edgeLeft).toBeCloseTo(result.left, 0)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('tbody .data-table__primary-column').first()).toHaveCSS(
    'position',
    'static',
  )
  const mobile = await page.locator('.data-table__scroll').evaluate(async (element) => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
    const scroller = element as HTMLElement
    const cell = scroller.querySelector<HTMLElement>('tbody .data-table__primary-column')!
    scroller.scrollLeft = 0
    const before = cell.getBoundingClientRect().left
    scroller.scrollLeft = Math.min(160, scroller.scrollWidth - scroller.clientWidth)
    scroller.dispatchEvent(new Event('scroll'))
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
    const edges = scroller.querySelector('.data-table__edges')!
    const shadow = getComputedStyle(edges, '::before')
    return {
      before,
      after: cell.getBoundingClientRect().left,
      shadowDisplay: shadow.display,
      shadowOpacity: Number.parseFloat(shadow.opacity),
      stickyShadowContent: getComputedStyle(cell, '::after').content,
      shadowHeight: Number.parseFloat(shadow.height),
      tableHeight: scroller.querySelector('table')!.getBoundingClientRect().height,
      edgeLeft: edges.getBoundingClientRect().left,
      viewportLeft: scroller.getBoundingClientRect().left,
    }
  })
  expect(mobile.after).toBeLessThan(mobile.before)
  expect(mobile.shadowDisplay).toBe('block')
  expect(mobile.shadowOpacity).toBeGreaterThan(0)
  expect(mobile.stickyShadowContent).toBe('none')
  expect(mobile.shadowHeight).toBeCloseTo(mobile.tableHeight, 0)
  expect(mobile.edgeLeft).toBeCloseTo(mobile.viewportLeft, 0)
  await expect(page.locator('.table-pagination__pages')).toHaveCSS('justify-content', 'center')
  await page.setViewportSize({ width: 900, height: 1000 })
  await expect(page.getByRole('button', { name: 'Export', exact: true }).locator('..')).toHaveCSS(
    'justify-content',
    'flex-end',
  )
  await page.setViewportSize({ width: 1600, height: 1000 })
}

test('loads the public app shell', async ({ page, checkAccessibility }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('link', { name: /QuickFE/ })).toBeVisible()
  expect(errors).toEqual([])
  await checkAccessibility('public-shell')
})

test('opens the sign-in form with its accessible input fields', async ({
  page,
  checkAccessibility,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('Email address', { exact: true })).toBeVisible()
  await expect(dialog.getByLabel('Password', { exact: true })).toBeVisible()
  await checkAccessibility('sign-in', '[role="dialog"]')
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

test('redirects the old settings activity bookmark to profile while preserving table query state', async ({
  page,
}) => {
  await page.goto('/settings/activity?page=2&take=25')
  await expect(page).toHaveURL(/\/profile\/activity\?page=2&take=25$/)
  await expect(page.getByRole('alert')).toContainText('You need to be signed in')
})

test('keeps the profile feed and table isolated and leaves settings for account configuration', async ({
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
    '/profile/activity',
  )
  await expect(page.getByRole('tab', { name: 'Activity', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'View all activity' }).click()
  await expect(page).toHaveURL(/\/profile\/activity$/)
  await expect(page.getByRole('tab', { name: 'Activity', exact: true })).toBeVisible()
  await expect(page.locator('tbody').getByText('Signed in', { exact: true })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Subject ID', exact: true })).toBeVisible()
  await expect(page.locator('tbody .badge').getByText('Identity', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Account', exact: true }).click()
  await expect(page).toHaveURL(/\/profile\/account$/)
  await expect(page.getByRole('link', { name: 'View all activity' })).toBeVisible()
  await expect.poll(() => takes).toEqual([5, 10, 5])
  await page.getByRole('tab', { name: 'Activity', exact: true }).click()
  await expect(page).toHaveURL(/\/profile\/activity$/)
  await expect.poll(() => takes).toEqual([5, 10, 5, 10])
  await expect(page.locator('tbody').getByText('Signed in', { exact: true })).toBeVisible()
  await page.goto('/settings/sessions')
  await expect(page.getByRole('tab', { name: 'Activity', exact: true })).toHaveCount(0)
})

test('navigates administration sections and their nested tabs', async ({
  page,
  checkAccessibility,
}) => {
  let refreshCount = 0
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
  await page.route('**/api/v1/authentication/refresh', (route) => {
    refreshCount++
    return route.fulfill({
      json: {
        refresh: expires,
        access_token: 'fixture-access',
        iat: expires - 3600,
        exp: expires,
        user: admin,
      },
    })
  })
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
  await expect(page).toHaveURL(/\/administration\/overview\/activity$/)
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
  await checkAccessibility('identity-table', '.data-table')
  const rowSelection = page.getByRole('checkbox', { name: 'Select row 1', exact: true })
  const selectAll = page.getByRole('checkbox', { name: 'Select all rows', exact: true })
  await rowSelection.press('Space')
  await expect(rowSelection).toBeChecked()
  await expect(selectAll).toBeChecked()
  await selectAll.press('Space')
  await expect(rowSelection).not.toBeChecked()
  await verifyStickyPrimaryColumn(page, true)
  await nav.getByRole('link', { name: 'Overview', exact: true }).click()
  await page.getByRole('tab', { name: 'Dashboard', exact: true }).click()
  await expect(
    page.getByText('Platform metrics and summaries will appear here.', { exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Activity', exact: true }).click()
  await expect(page.getByText('No platform activity found.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible()
  expect(refreshCount).toBe(1)
  await page.goto('/administration/articles')
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

  test('filter selects and dates work by keyboard without escaping the offcanvas', async ({
    page,
    checkAccessibility,
  }) => {
    await page.goto('/administration/overview/activity')
    const activityTab = page.getByRole('tab', { name: 'Activity', exact: true })
    const dashboardTab = page.getByRole('tab', { name: 'Dashboard', exact: true })
    await activityTab.press('Home')
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(dashboardTab).toBeFocused()
    await expect(
      page.getByText('Platform metrics and summaries will appear here.', { exact: true }),
    ).toBeVisible()
    await dashboardTab.press('End')
    await expect(page).toHaveURL(/\/activity$/)
    await expect(activityTab).toBeFocused()
    await expect(activityTab).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('tbody').getByText('Signed in', { exact: true })).toBeVisible()
    const trigger = page.getByRole('button', { name: 'Filter platform activity', exact: true })
    await trigger.press('Enter')
    const dialog = page.getByRole('dialog')
    const domain = dialog.getByLabel('Domain', { exact: true })
    await domain.press('Space')
    const list = page.getByRole('listbox')
    await expect(list).toBeFocused()
    await checkAccessibility('filter-select-open', '[role="dialog"]')
    await checkAccessibility('filter-listbox', '[role="listbox"]')
    await page.keyboard.press('End')
    await page.keyboard.press('Escape')
    await expect(list).toBeHidden()
    await expect(dialog).toBeVisible()
    await expect(domain).toBeFocused()
    await domain.press('ArrowDown')
    await expect(list).toBeFocused()
    await page.keyboard.press('End')
    await page.keyboard.press('Space')
    await expect(domain).toHaveValue('Articles')
    await expect(domain).toBeFocused()
    await domain.press('Enter')
    await expect(list).toBeFocused()
    await page.keyboard.press('Tab')
    const from = dialog.getByLabel('From date', { exact: true })
    await expect(from).toBeFocused()
    await from.pressSequentially('20261001')
    await expect(from).toHaveValue('2026-10-01')
    await page.keyboard.press('Tab')
    const to = dialog.getByLabel('To date', { exact: true })
    await expect(to).toBeFocused()
    await to.pressSequentially('20261013')
    await expect(to).toHaveValue('2026-10-13')
    await dialog.getByRole('button', { name: 'Apply filters', exact: true }).press('Enter')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(page).toHaveURL(/domain=articles/)
    const eventSort = page
      .getByRole('columnheader', { name: 'Event', exact: true })
      .getByRole('button')
    await eventSort.press('Space')
    await expect(page).toHaveURL(/sort=event/)
    await expect(eventSort).toBeFocused()
    await eventSort.press('Enter')
    await expect(page).toHaveURL(/order=DESC/)
  })

  test('applies draft filters from the right panel and preserves them across sorting, pagination and refresh', async ({
    page,
    checkAccessibility,
  }) => {
    const queries: URLSearchParams[] = []
    await page.route('**/api/v1/administration/audits?*', (route) => {
      const query = new URL(route.request().url()).searchParams
      queries.push(query)
      const currentPage = Number(query.get('page') ?? 1)
      return route.fulfill({
        json: {
          data: [auditFixture],
          meta: {
            page: currentPage,
            take: Number(query.get('take') ?? 10),
            itemCount: 75,
            pageCount: 3,
            hasPreviousPage: currentPage > 1,
            hasNextPage: currentPage < 3,
          },
        },
      })
    })
    await page.goto(
      '/administration/overview/activity?page=3&take=25&sort=event&order=DESC&event=identity.sign_in.succeeded',
    )
    await expect(page.locator('tbody').getByText('Signed in', { exact: true })).toBeVisible()
    await checkAccessibility('activity-table', '.data-table')
    await verifyStickyPrimaryColumn(page, false)
    await page.getByRole('button', { name: 'Filter platform activity', exact: true }).click()
    const panel = page.getByRole('dialog')
    await expect(panel.locator('.offcanvas__panel--right')).toBeVisible()
    await checkAccessibility('activity-filters', '[role="dialog"]')
    await expect(panel.getByLabel('Event', { exact: true })).toHaveValue('Signed in')
    await panel.getByLabel('Event', { exact: true }).click()
    await page.getByRole('option', { name: 'Article published', exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    expect(queries).toHaveLength(1)
    await page.getByRole('button', { name: 'Filter platform activity', exact: true }).click()
    await expect(panel.getByLabel('Event', { exact: true })).toHaveValue('Signed in')
    await panel.getByLabel('Domain', { exact: true }).click()
    await page.getByRole('option', { name: 'Articles', exact: true }).click()
    await panel.getByLabel('Actor type', { exact: true }).click()
    await page.getByRole('option', { name: 'User', exact: true }).click()
    await panel.getByLabel('Event', { exact: true }).click()
    await page.getByRole('option', { name: 'Article published', exact: true }).click()
    await expect(panel.getByLabel('Actor ID', { exact: true })).toHaveAttribute(
      'placeholder',
      /0R0qvHpKKEKuDy5F/,
    )
    await panel.getByLabel('Actor ID', { exact: true }).fill('actor-example')
    await panel.getByLabel('From date', { exact: true }).fill('2026-10-13')
    await panel.getByLabel('To date', { exact: true }).fill('2026-10-01')
    await panel.getByRole('button', { name: 'Apply filters', exact: true }).click()
    await expect(panel.getByRole('alert')).toContainText(
      'The from date must be on or before the to date.',
    )
    await checkAccessibility('activity-filters-invalid', '[role="dialog"]')
    expect(queries).toHaveLength(1)
    await panel.getByLabel('From date', { exact: true }).fill('2026-10-01')
    await panel.getByLabel('To date', { exact: true }).fill('2026-10-13')
    await panel.getByRole('button', { name: 'Apply filters', exact: true }).click()
    await expect(panel).toHaveCount(0)
    await expect.poll(() => queries.length).toBe(2)
    expect(queries[1]?.get('page')).toBe('1')
    expect(new URL(page.url()).searchParams.has('page')).toBe(false)
    expect(queries[1]?.get('domain')).toBe('articles')
    expect(queries[1]?.get('actorType')).toBe('user')
    expect(queries[1]?.get('actorId')).toBe('actor-example')
    expect(queries[1]?.get('sort')).toBe('event')
    expect(queries[1]?.get('take')).toBe('25')
    const bounds = await page.evaluate(() => [
      new Date('2026-10-01T00:00:00.000').toISOString(),
      new Date('2026-10-13T23:59:59.999').toISOString(),
    ])
    expect(queries[1]?.get('occurredFrom')).toBe(bounds[0])
    expect(queries[1]?.get('occurredTo')).toBe(bounds[1])
    await page.getByRole('button', { name: 'Page 2', exact: true }).press('Enter')
    await expect.poll(() => queries.at(-1)?.get('page')).toBe('2')
    expect(queries.at(-1)?.get('domain')).toBe('articles')
    await page
      .getByRole('columnheader', { name: 'Domain', exact: true })
      .getByRole('button')
      .click()
    await expect.poll(() => queries.at(-1)?.get('sort')).toBe('domain')
    expect(queries.at(-1)?.get('page')).toBe('1')
    expect(new URL(page.url()).searchParams.has('page')).toBe(false)
    expect(queries.at(-1)?.get('event')).toBe('articles.article.published')
    await page.reload()
    await page.getByRole('button', { name: 'Filter platform activity', exact: true }).click()
    await expect(panel.getByLabel('Domain', { exact: true })).toHaveValue('Articles')
    await expect(panel.getByLabel('From date', { exact: true })).toHaveValue('2026-10-01')
    await panel.getByRole('button', { name: 'Clear filters', exact: true }).click()
    await expect(panel).toHaveCount(0)
    await expect.poll(() => queries.at(-1)?.get('domain')).toBeNull()
    expect(queries.at(-1)?.get('actorId')).toBeNull()
    expect(queries.at(-1)?.get('occurredFrom')).toBeNull()
    expect(queries.at(-1)?.get('page')).toBe('1')
    expect(queries.at(-1)?.get('sort')).toBe('domain')
    expect(queries.at(-1)?.get('take')).toBe('25')
    const pageSize = page.getByRole('combobox', { name: 'Rows per page', exact: true })
    await pageSize.press('Enter')
    await expect(page.getByRole('listbox')).toBeFocused()
    await page.keyboard.press('Home')
    await page.keyboard.press('Enter')
    await expect.poll(() => queries.at(-1)?.get('take')).toBe('10')
    expect(new URL(page.url()).searchParams.has('take')).toBe(false)
    await page.reload()
    await expect(page.getByRole('combobox', { name: 'Rows per page', exact: true })).toHaveValue(
      '10',
    )
    expect(queries.at(-1)?.get('take')).toBe('10')
  })

  test('retries details, displays payloads, and closes on page navigation', async ({
    page,
    checkAccessibility,
  }) => {
    let calls = 0
    let release!: () => void
    const loading = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/api/v1/administration/audits/audit-example', async (route) => {
      calls += 1
      if (calls === 1) await loading
      return calls === 1
        ? route.fulfill({ status: 500, json: { message: 'temporary failure' } })
        : route.fulfill({ json: auditFixture })
    })
    await page.goto('/administration/overview/dashboard')
    await page.getByRole('tab', { name: 'Activity', exact: true }).click()
    await page.getByRole('button', { name: 'View audit details', exact: true }).click()
    const dialog = page.getByRole('dialog')
    try {
      await expect(dialog.getByRole('status')).toBeVisible()
      await checkAccessibility('audit-detail-loading', '[role="dialog"]')
    } finally {
      release()
    }
    await expect(dialog.getByRole('alert')).toContainText('Unable to load audit details')
    await checkAccessibility('audit-detail-error', '[role="dialog"]')
    await dialog.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(dialog.getByText('request-example', { exact: true })).toBeVisible()
    await expect(dialog.getByText('operation-example', { exact: true })).toBeVisible()
    await checkAccessibility('audit-detail-loaded', '[role="dialog"]')
    await expect(dialog.locator('code')).toContainText('before: Before')
    await dialog.getByRole('tab', { name: 'Before', exact: true }).click()
    await expect(dialog.locator('code')).toContainText('name: Before')
    await dialog.getByRole('tab', { name: 'After', exact: true }).click()
    await expect(dialog.locator('code')).toContainText('name: After')
    await dialog.getByRole('tab', { name: 'Metadata', exact: true }).click()
    await expect(dialog.getByText('No data recorded.', { exact: true })).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(/\/administration\/overview\/dashboard$/)
    await expect(dialog).toHaveCount(0)
    expect(calls).toBe(2)
  })

  test('shows unavailable records and supports closing with Escape', async ({
    page,
    checkAccessibility,
  }) => {
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
    await checkAccessibility('audit-detail-unavailable', '[role="dialog"]')
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
