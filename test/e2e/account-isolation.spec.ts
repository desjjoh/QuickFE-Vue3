import { test, expect } from './fixtures'
import { userFixture, auditFixture } from '@test/support/api-fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

for (const [path, endpoint, users] of [
  ['/profile/activity', 'account/activity', false],
  ['/administration/overview/activity', 'administration/audits', false],
  ['/administration/identity/users', 'administration/users', true],
] as const) {
  const marker = (id: string) => (users ? `only-${id}@example.test` : `only-${id}`)

  test(`never exposes A's records to B on ${path}`, async ({ page }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600
    const account = (id: string) => ({
      ...userFixture,
      id,
      roles: [
        {
          ...userFixture.status,
          key: 'administrator',
          permissions: ['has_all_permissions'],
        },
      ],
    })
    const jwt = (id: string, token: string) => ({
      access_token: token,
      refresh: expires,
      iat: expires - 3600,
      exp: expires,
      user: account(id),
    })
    await page.addInitScript(
      (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
      expires,
    )
    await page.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'csrf', iat: expires - 3600, exp: expires } }),
    )
    await page.route('**/api/v1/authentication/refresh', (route) =>
      route.fulfill({ json: jwt('aaaaaaaaaaaaaaaa', 'account-A') }),
    )
    await page.route('**/api/v1/authentication/sign-in', (route) =>
      route.fulfill({ json: jwt('bbbbbbbbbbbbbbbb', 'account-B') }),
    )
    await page.route('**/api/v1/authentication/sign-out', (route) => route.fulfill({ status: 204 }))
    let release!: () => void
    const pendingB = new Promise<void>((resolve) => {
      release = resolve
    })
    let bRequests = 0
    await page.route(`**/api/v1/${endpoint}*`, async (route) => {
      const id =
        route.request().headers().authorization === 'Bearer account-A' ? 'account-A' : 'account-B'
      if (id === 'account-B') {
        bRequests++
        await pendingB
      }
      const record = users
        ? { ...account(id), version: 1, identity: { email: marker(id) } }
        : { ...auditFixture, subjectId: marker(id) }
      await route.fulfill({
        json: {
          data: [record],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        },
      })
    })
    await page.goto(path)
    await expect(page.locator('tbody')).toContainText(marker('account-A'))
    await page.getByRole('button', { name: 'User avatar', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
    await expect(page.getByText(marker('account-A'), { exact: true })).toHaveCount(0)
    await page.evaluate((oldMarker) => {
      document.documentElement.dataset.accountALeaked = 'false'
      new MutationObserver(() => {
        if (
          document.body.textContent?.includes(oldMarker) &&
          document.documentElement.dataset.accountALeaked !== 'true'
        )
          document.documentElement.dataset.accountALeaked = 'true'
      }).observe(document.body, { childList: true, subtree: true, characterData: true })
    }, marker('account-A'))
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Email address', { exact: true }).fill('account-B@example.test')
    await dialog.getByLabel('Password', { exact: true }).fill('example-password')
    await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect.poll(() => bRequests).toBe(1)
    await expect(dialog).toBeHidden()
    await expect(page.locator('tbody')).toHaveCount(0)
    release()
    await expect(page.locator('tbody')).toContainText(marker('account-B'))
    await expect(page.locator('html')).toHaveAttribute('data-account-a-leaked', 'false')
    await expect(page.locator('tbody')).not.toContainText(marker('account-A'))
    expect(bRequests).toBe(1)
  })
}
