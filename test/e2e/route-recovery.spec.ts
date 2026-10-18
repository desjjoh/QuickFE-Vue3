import { test, expect } from './fixtures'
import { userFixture } from '@test/support/api-fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

for (const [path, endpoint, sessions] of [
  ['/profile/account', 'account/activity', false],
  ['/profile/activity?page=2', 'account/activity', false],
  ['/settings/sessions', 'account/sessions', true],
  ['/administration/overview/activity', 'administration/audits', false],
  ['/administration/identity/users', 'administration/users', false],
] as const) {
  test(`prepares ${path} after sign-in before releasing its guard`, async ({ page }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600
    const user = {
      ...userFixture,
      roles: [
        {
          ...userFixture.status,
          key: 'administrator',
          label: 'Administrator',
          permissions: ['has_all_permissions'],
        },
      ],
    }
    await page.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'csrf', iat: expires - 3600, exp: expires } }),
    )
    await page.route('**/api/v1/authentication/sign-in', (route) =>
      route.fulfill({
        json: {
          access_token: 'access',
          refresh: expires,
          iat: expires - 3600,
          exp: expires,
          user,
        },
      }),
    )
    let release!: () => void
    const response = new Promise<void>((resolve) => {
      release = resolve
    })
    let requests = 0
    await page.route(`**/api/v1/${endpoint}*`, async (route) => {
      requests++
      await response
      await route.fulfill({
        json: sessions
          ? []
          : {
              data: [],
              meta: {
                page: 1,
                take: 10,
                itemCount: 0,
                pageCount: 0,
                hasPreviousPage: false,
                hasNextPage: false,
              },
            },
      })
    })
    await page.goto(path)
    await expect(
      page.getByRole('alert').filter({ hasText: 'You need to be signed in' }),
    ).toContainText('You need to be signed in')
    expect(requests).toBe(0)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Email address', { exact: true }).fill('user@example.test')
    await dialog.getByLabel('Password', { exact: true }).fill('example-password')
    await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect.poll(() => requests).toBe(1)
    await expect(dialog).toBeHidden()
    await expect(
      page.getByRole('alert').filter({ hasText: 'You need to be signed in' }),
    ).toContainText('You need to be signed in')
    await expect(page.locator('main [role=tablist]')).toHaveCount(0)
    release()
    await expect(page.locator('main [role=tablist]').first()).toBeVisible()
    await expect(page.getByText('You need to be signed in', { exact: true })).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(path.replace('?', '\\?') + '$'))
    expect(requests).toBe(1)
  })
}
