import { test, expect } from './fixtures'
import { userFixture } from '@test/support/api-fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

for (const outcome of ['success', 'failure'] as const) {
  test(`a late account mutation ${outcome} cannot change a replacement session or its dialog`, async ({
    page,
  }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600
    const account = (id: string) => ({
      ...userFixture,
      id,
      identity: { email: `${id}@example.test` },
    })
    await page.addInitScript(
      (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
      expires,
    )
    await page.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'csrf', iat: expires - 3600, exp: expires } }),
    )
    let refreshes = 0
    await page.route('**/api/v1/authentication/refresh', (route) => {
      refreshes++
      return route.fulfill({
        json: {
          access_token: 'account-A',
          refresh: expires,
          iat: expires - 3600,
          exp: expires,
          user: account('account-A'),
        },
      })
    })
    let release!: () => void
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    let mutations = 0
    await page.route('**/api/v1/account/delete', async (route) => {
      mutations++
      expect(route.request().headers().authorization).toBe('Bearer account-A')
      await held
      if (outcome === 'success') await route.fulfill({ status: 204 })
      else await route.fulfill({ status: 422, json: { message: 'private account-A error' } })
    })
    await page.goto('/settings/security')
    await expect(page.getByText('account-A@example.test', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Delete account', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('input[name="password"]').fill('old-password')
    await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect.poll(() => mutations).toBe(1)
    await page.evaluate(
      ({ user, expires }) => {
        const channel = new BroadcastChannel('quickfe-auth-session')
        const sessionKey = crypto.randomUUID()
        localStorage.setItem(
          'quickfe_auth_identity',
          JSON.stringify({ key: sessionKey, userId: user.id }),
        )
        channel.postMessage({
          source: 'session-ownership-test',
          type: 'auth:authenticated',
          sessionKey,
          user,
          accessToken: { token: 'account-B', iat: expires - 3600, exp: expires },
          refresh: expires,
        })
        channel.close()
      },
      { user: account('account-B'), expires },
    )
    await expect(page.getByText('account-B@example.test', { exact: true })).toBeVisible()
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Delete account', exact: true }).click()
    await expect(dialog).toBeVisible()
    const response = page.waitForResponse('**/api/v1/account/delete')
    release()
    await response
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await expect(dialog).toBeVisible()
    await expect(page.getByText('account-B@example.test', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0)
    await expect(page.getByText('private account-A error', { exact: true })).toHaveCount(0)
    expect(refreshes).toBe(1)
    expect(mutations).toBe(1)
  })
}
