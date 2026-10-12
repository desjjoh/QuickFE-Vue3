import { test, expect } from '@playwright/test'
import { userFixture } from '../src/shared/api/__tests__/fixtures'

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
