import { test, expect } from './fixtures'
import { userFixture } from '@test/support/api-fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

for (const invalid of ['malformed', 'unsupported'] as const) {
  test(`starts and applies safe preferences with ${invalid} saved browser data`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.emulateMedia({ colorScheme: 'light' })
    await page.addInitScript((kind) => {
      localStorage.setItem('theme_mode', kind === 'malformed' ? '{broken' : '"sepia"')
      localStorage.setItem('i18n-locale', kind === 'malformed' ? '{broken' : '"toString"')
      localStorage.setItem('refresh_expiry', '{broken')
      localStorage.setItem('quickfe_auth_identity', '{broken')
      localStorage.setItem('quickfe_auth_refresh_lock', '{broken')
    }, invalid)
    await page.goto('/playground')
    await expect(page.locator('.json-viewer').first()).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(
      page.locator('header').getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeVisible()
    expect(errors).toEqual([])
  })
}

for (const unavailable of ['blocked', 'quota'] as const) {
  test(`keeps sign-in and route navigation usable with ${unavailable} browser persistence`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript((kind) => {
      if (kind === 'blocked') {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() {
            throw new DOMException('Blocked storage', 'SecurityError')
          },
        })
      } else {
        localStorage.setItem(
          'quickfe_auth_identity',
          JSON.stringify({ key: 'previous-guest', userId: null }),
        )
        Storage.prototype.setItem = () => {
          throw new DOMException('Storage quota', 'QuotaExceededError')
        }
      }
    }, unavailable)
    const expires = Math.floor(Date.now() / 1000) + 3600
    await page.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'csrf', iat: expires - 3600, exp: expires } }),
    )
    await page.route('**/api/v1/authentication/sign-in', (route) =>
      route.fulfill({
        json: {
          access_token: 'local-access',
          iat: expires - 3600,
          exp: expires,
          refresh: expires,
          user: userFixture,
        },
      }),
    )
    let sessions = 0
    await page.route('**/api/v1/account/sessions*', (route) => {
      sessions++
      expect(route.request().headers().authorization).toBe('Bearer local-access')
      return route.fulfill({ json: [] })
    })
    await page.goto('/settings/security')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Email address', { exact: true }).fill(userFixture.identity.email)
    await dialog.getByLabel('Password', { exact: true }).fill('example-password')
    await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByRole('tab', { name: 'Sessions', exact: true })).toBeVisible()
    await expect(dialog).toBeHidden()
    await page.getByRole('tab', { name: 'Sessions', exact: true }).click()
    await expect(page).toHaveURL(/\/settings\/sessions$/)
    await expect(page.getByRole('tab', { name: 'Sessions', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0)
    expect(sessions).toBe(1)
    expect(errors).toEqual([])
  })
}
