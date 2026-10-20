import { test, expect } from './fixtures'
import { userFixture } from '@test/support/api-fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

test('two profile tabs share the sign-in credentials without rotating CSRF or refresh tokens', async ({
  page,
  context,
}) => {
  const now = Math.floor(Date.now() / 1000)
  const session = {
    access_token: 'shared-access',
    iat: now,
    exp: now + 3600,
    refresh: now + 7200,
    user: userFixture,
  }
  let csrfRequests = 0
  let refreshRequests = 0
  let csrf = ''
  let activityRequests = 0
  const activityStatuses: number[] = []
  let release!: () => void
  const bothRequested = new Promise<void>((resolve) => {
    release = resolve
  })
  await context.route('**/api/v1/public/library/*', (route) => route.fulfill({ json: [] }))
  await context.route('**/api/v1/security/csrf', (route) => {
    csrf = `csrf-${++csrfRequests}`
    return route.fulfill({ json: { token: csrf, iat: now, exp: now + 900 } })
  })
  await context.route('**/api/v1/authentication/sign-in', (route) =>
    route.fulfill({ json: session }),
  )
  await context.route('**/api/v1/authentication/refresh', (route) => {
    refreshRequests++
    return route.fulfill({ json: session })
  })
  await context.route('**/api/v1/account/activity?*', async (route) => {
    activityRequests++
    if (activityRequests === 2) release()
    await bothRequested
    const status = route.request().headers()['x-csrf-token'] === csrf ? 200 : 403
    activityStatuses.push(status)
    await route.fulfill({
      status,
      json:
        status === 200
          ? {
              data: [],
              meta: {
                page: 1,
                take: 5,
                itemCount: 0,
                pageCount: 0,
                hasPreviousPage: false,
                hasNextPage: false,
              },
            }
          : { message: 'Forbidden resource' },
    })
  })
  await page.goto('/profile/account')
  const other = await context.newPage()
  await other.goto('/profile/account')
  await expect(other.getByRole('alert')).toContainText('You need to be signed in')
  await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Email address', { exact: true }).fill(userFixture.identity.email)
  await dialog.getByLabel('Password', { exact: true }).fill('example-password')
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Recent activity', exact: true })).toBeVisible()
  await expect(other.getByRole('heading', { name: 'Recent activity', exact: true })).toBeVisible()
  expect(activityStatuses).toEqual([200, 200])
  expect(csrfRequests).toBe(1)
  expect(refreshRequests).toBe(0)
  await other.close()
})

for (const channelEnabled of [true, false]) {
  test(`the other tab follows logout and account replacement without reload (channel ${channelEnabled})`, async ({
    page,
    context,
  }) => {
    await context.addInitScript((enabled) => {
      if (!enabled) Reflect.deleteProperty(window, 'BroadcastChannel')
    }, channelEnabled)
    const now = Math.floor(Date.now() / 1000)
    const session = (email: string) => ({
      access_token: email,
      iat: now,
      exp: now + 3600,
      refresh: now + 7200,
      user: { ...userFixture, id: email, identity: { email } },
    })
    let current: ReturnType<typeof session> | null = null
    await context.route('**/api/v1/public/library/*', (route) => route.fulfill({ json: [] }))
    await context.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'csrf', iat: now, exp: now + 900 } }),
    )
    await context.route('**/api/v1/authentication/sign-in', (route) => {
      current = session(route.request().postDataJSON().email)
      return route.fulfill({ json: current })
    })
    await context.route('**/api/v1/authentication/sign-out', (route) => {
      current = null
      return route.fulfill({ status: 204 })
    })
    await context.route('**/api/v1/authentication/refresh', (route) =>
      current
        ? route.fulfill({ json: current })
        : route.fulfill({ status: 401, json: { message: 'Unauthorized' } }),
    )
    const signIn = async (email: string) => {
      await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByLabel('Email address', { exact: true }).fill(email)
      await dialog.getByLabel('Password', { exact: true }).fill('example-password')
      await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
      await expect(dialog).toBeHidden()
      await expect(page.getByText(email, { exact: true })).toBeVisible()
    }
    await page.goto('/settings/security')
    await signIn('account-A@example.test')
    const other = await context.newPage()
    await other.goto('/settings/security')
    await expect(other.getByText('account-A@example.test', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'User avatar', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(
      other.locator('header').getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeVisible()
    await expect(other.getByText('account-A@example.test', { exact: true })).toHaveCount(0)
    await signIn('account-B@example.test')
    await expect(other.getByText('account-B@example.test', { exact: true })).toBeVisible()
    await expect(other.getByText('account-A@example.test', { exact: true })).toHaveCount(0)
    await other.close()
  })
}

test('serializes simultaneous tab reloads even when storage lock reads are stale', async ({
  page,
  context,
}) => {
  const now = Math.floor(Date.now() / 1000)
  const credentials = {
    access_token: 'access',
    iat: now,
    exp: now + 3600,
    refresh: now + 7200,
    user: userFixture,
  }
  let generation = 0
  let refreshes = 0
  let active = 0
  let maximumActive = 0
  let hold = false
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await context.route('**/api/v1/public/library/*', (route) => route.fulfill({ json: [] }))
  await context.route('**/api/v1/security/csrf', (route) =>
    route.fulfill({ json: { token: 'csrf', iat: now, exp: now + 900 } }),
  )
  await context.route('**/api/v1/authentication/sign-in', (route) =>
    route.fulfill({ json: credentials }),
  )
  await context.route('**/api/v1/authentication/refresh', async (route) => {
    refreshes++
    maximumActive = Math.max(maximumActive, ++active)
    const snapshot = generation
    if (hold) await held
    active--
    if (snapshot !== generation) {
      await route.fulfill({
        status: 401,
        json: {
          message: 'Session credentials have already rotated or been revoked. Sign in again.',
        },
      })
      return
    }
    generation++
    await route.fulfill({ json: { ...credentials, access_token: `access-${generation}` } })
  })
  await page.goto('/settings/security')
  await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Email address', { exact: true }).fill(userFixture.identity.email)
  await dialog.getByLabel('Password', { exact: true }).fill('example-password')
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
  const other = await context.newPage()
  await other.goto('/settings/security')
  await expect(other.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
  expect(refreshes).toBe(0)

  // Force the stale read possible when two processes inspect the storage mutex
  // before either writes it. Web Locks must provide exclusion independently.
  await context.addInitScript(() => {
    const getItem = Storage.prototype.getItem
    Storage.prototype.getItem = function (key) {
      return key === 'quickfe_auth_refresh_lock' ? null : getItem.call(this, key)
    }
  })
  hold = true
  const reloading = Promise.all([page.reload(), other.reload()])
  try {
    await expect.poll(() => refreshes).toBe(1)
    await expect
      .poll(async () => {
        const locks = await page.evaluate(() => navigator.locks.query())
        return locks.pending?.filter((lock) => lock.name === 'quickfe-auth-session').length
      })
      .toBe(1)
    expect(maximumActive).toBe(1)
  } finally {
    release()
    await reloading
  }
  await expect(page.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
  await expect(other.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
  expect(maximumActive).toBe(1)
  expect(await page.evaluate(() => localStorage.getItem('refresh_expiry'))).not.toBeNull()
  await other.close()
})

// Deliberately do not seed localStorage: sign-in must persist everything needed
// for a reload and a genuinely new tab to recover their own in-memory state.
for (const { failure, refreshesAfterReload } of [
  { failure: undefined, refreshesAfterReload: 1 },
  { failure: 403, refreshesAfterReload: 2 },
]) {
  test(`sign-in survives reload and a new tab with initial refresh status ${failure ?? 200}`, async ({
    page,
    context,
  }) => {
    const now = Math.floor(Date.now() / 1000)
    const credentials = {
      access_token: 'browser-access',
      iat: now,
      exp: now + 3600,
      refresh: now + 7200,
      user: userFixture,
    }
    let csrfRequests = 0
    let refreshRequests = 0
    await context.route('**/api/v1/public/library/*', (route) => route.fulfill({ json: [] }))
    await context.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: `csrf-${++csrfRequests}`, iat: now, exp: now + 900 } }),
    )
    await context.route('**/api/v1/authentication/sign-in', (route) =>
      route.fulfill({ json: credentials }),
    )
    await context.route('**/api/v1/authentication/refresh', async (route) => {
      refreshRequests++
      if (refreshRequests === 1 && failure) {
        await route.fulfill({ status: failure, json: { message: 'Refresh unavailable' } })
        return
      }
      expect(route.request().headers()['x-csrf-token']).toMatch(/^csrf-\d+$/)
      await route.fulfill({ json: credentials })
    })

    await page.goto('/settings/security')
    await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Email address', { exact: true }).fill(userFixture.identity.email)
    await dialog.getByLabel('Password', { exact: true }).fill('example-password')
    await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
    const identity = await page.evaluate(() => localStorage.getItem('quickfe_auth_identity'))

    await page.reload()
    await expect(page.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('quickfe_auth_identity'))).toBe(identity)
    expect(refreshRequests).toBe(refreshesAfterReload)

    const otherTab = await context.newPage()
    await otherTab.goto('/settings/security')
    await expect(otherTab.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
    await expect(page.getByText(userFixture.identity.email, { exact: true })).toBeVisible()
    expect(refreshRequests).toBe(refreshesAfterReload)
    expect(await otherTab.evaluate(() => localStorage.getItem('quickfe_auth_identity'))).toBe(
      identity,
    )
    await otherTab.close()
  })
}
