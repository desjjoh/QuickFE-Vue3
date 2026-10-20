import { test, expect } from './fixtures'
import type { BrowserContext, Page } from '@playwright/test'
import { userFixture } from '@test/support/api-fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

for (const outcome of ['success', 'failure'] as const) {
  test(`a delayed sign-in ${outcome} cannot replace a newer cross-tab account or close its dialog`, async ({
    page,
    context,
  }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600
    await context.route('**/api/v1/public/library/*', (route) => route.fulfill({ json: [] }))
    await context.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'csrf', iat: expires - 3600, exp: expires } }),
    )
    let release!: () => void
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    let requests = 0
    await context.route('**/api/v1/authentication/sign-in', async (route) => {
      const email = route.request().postDataJSON().email as string
      const old = email === 'account-A@example.test'
      requests++
      if (old) await held
      if (old && outcome === 'failure') {
        await route.fulfill({ status: 401, json: { message: 'old sign-in failure' } })
      } else {
        await route.fulfill({
          json: {
            access_token: email,
            refresh: expires,
            iat: expires - 3600,
            exp: expires,
            user: { ...userFixture, id: email, identity: { email } },
          },
        })
      }
    })
    await page.goto('/settings/security')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    const oldDialog = page.getByRole('dialog')
    await oldDialog.getByLabel('Email address', { exact: true }).fill('account-A@example.test')
    await oldDialog.getByLabel('Password', { exact: true }).fill('example-password')
    await oldDialog.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect.poll(() => requests).toBe(1)

    const otherTab = await context.newPage()
    await otherTab.goto('/settings/security')
    // Guest bootstrap in the new tab purges the old anonymous workflow first.
    await expect(oldDialog).toBeHidden()
    await otherTab.getByRole('button', { name: 'Sign in', exact: true }).click()
    const nextDialog = otherTab.getByRole('dialog')
    await nextDialog.getByLabel('Email address', { exact: true }).fill('account-B@example.test')
    await nextDialog.getByLabel('Password', { exact: true }).fill('example-password')
    await nextDialog.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByText('account-B@example.test', { exact: true })).toBeVisible()
    await expect(oldDialog).toBeHidden()
    await page.getByRole('button', { name: 'Delete account', exact: true }).click()
    await expect(oldDialog).toBeVisible()
    const response = page.waitForResponse('**/api/v1/authentication/sign-in')
    release()
    await response
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await expect(oldDialog).toBeVisible()
    await expect(page.getByText('account-B@example.test', { exact: true })).toBeVisible()
    await expect(otherTab.getByText('account-B@example.test', { exact: true })).toBeVisible()
    await expect(page.getByText('old sign-in failure', { exact: true })).toHaveCount(0)
    expect(requests).toBe(2)
    await otherTab.close()
  })
}

function session(email: string, token = email) {
  const now = Math.floor(Date.now() / 1000)
  return {
    access_token: token,
    iat: now,
    exp: now + 3600,
    refresh: now + 7200,
    user: { ...userFixture, id: email, identity: { email } },
  }
}

async function mockCredentials(context: BrowserContext) {
  await context.route('**/api/v1/public/library/*', (route) => route.fulfill({ json: [] }))
  await context.route('**/api/v1/security/csrf', (route) =>
    route.fulfill({ json: { token: 'csrf', iat: 0, exp: 4102444800 } }),
  )
}

async function signIn(page: Page, email: string) {
  await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Email address', { exact: true }).fill(email)
  await dialog.getByLabel('Password', { exact: true }).fill('example-password')
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'User avatar', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Sign out', exact: true }).click()
}

async function settleResponse(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
}

for (const identity of ['other-account', 'same-account'] as const) {
  const replacementEmail =
    identity === 'same-account' ? 'account-A@example.test' : 'account-B@example.test'
  for (const outcome of ['success', 'failure'] as const) {
    test(`a delayed sign-out ${outcome} preserves a newer ${identity} login and dialog`, async ({
      page,
      context,
    }) => {
      await mockCredentials(context)
      const initial = session('account-A@example.test', 'initial-access')
      await context.addInitScript(
        (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
        initial.refresh,
      )
      await context.route('**/api/v1/authentication/refresh', (route) =>
        route.fulfill({ json: initial }),
      )
      await context.route('**/api/v1/authentication/sign-in', (route) =>
        route.fulfill({ json: session(replacementEmail, 'replacement-access') }),
      )
      let release!: () => void
      const held = new Promise<void>((resolve) => {
        release = resolve
      })
      let requests = 0
      await context.route('**/api/v1/authentication/sign-out', async (route) => {
        const first = ++requests === 1
        if (first) await held
        if (first && outcome === 'failure')
          await route.fulfill({ status: 422, json: { message: 'old sign-out failure' } })
        else await route.fulfill({ status: 204 })
      })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('/settings/security')
      const otherTab = await context.newPage()
      await otherTab.goto('/settings/security')
      await expect(otherTab.getByText(initial.user.identity.email, { exact: true })).toBeVisible()
      const previousKey = await page.evaluate(
        () => JSON.parse(localStorage.getItem('quickfe_auth_identity')!).key,
      )
      await signOut(page)
      await expect.poll(() => requests).toBe(1)
      await signOut(otherTab)
      await expect(otherTab.getByRole('dialog')).toBeHidden()
      await expect(
        page.locator('header').getByRole('button', { name: 'Sign in', exact: true }),
      ).toBeVisible()
      await signIn(otherTab, replacementEmail)
      await expect(otherTab.getByRole('dialog')).toBeHidden()
      await expect(page.getByText(replacementEmail, { exact: true })).toBeVisible()
      await expect
        .poll(() =>
          page.evaluate(() => JSON.parse(localStorage.getItem('quickfe_auth_identity')!).key),
        )
        .not.toBe(previousKey)
      await expect(page.getByRole('dialog')).toBeHidden()
      await page.getByRole('button', { name: 'Delete account', exact: true }).click()
      await expect(page.getByRole('dialog').locator('input[name="password"]')).toBeVisible()
      const response = page.waitForResponse('**/api/v1/authentication/sign-out')
      release()
      await response
      await settleResponse(page)
      await expect(page.getByRole('dialog').locator('input[name="password"]')).toBeVisible()
      await expect(page.getByText(replacementEmail, { exact: true })).toBeVisible()
      await expect(
        page.locator('header').getByRole('button', { name: 'Sign in', exact: true }),
      ).toHaveCount(0)
      await expect(page.getByText('old sign-out failure', { exact: true })).toHaveCount(0)
      expect(requests).toBe(2)
      expect(errors).toEqual([])
      await otherTab.close()
    })
  }
}

const openVerification = {
  mfa: (page: Page) => signIn(page, 'old@example.test'),
  registration: async (page: Page) => {
    await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Send a new verification email', exact: true })
      .click()
    await page
      .getByRole('dialog', { name: 'Send a new verification email', exact: true })
      .getByLabel('Email address', { exact: true })
      .fill('old@example.test')
    await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click()
  },
}

for (const kind of ['mfa', 'registration'] as const) {
  const endpoint = kind === 'mfa' ? 'sign-in/mfa/verify' : 'registration/confirm'
  for (const outcome of ['success', 'failure'] as const) {
    test(`canceled ${kind} verification ${outcome} cannot authenticate or replace a new sign-in draft`, async ({
      page,
      context,
    }) => {
      await mockCredentials(context)
      const challenge = {
        challenge_id: 'old-challenge',
        method: 'email_otp',
        expires_at: '2100-01-01T00:00:00Z',
        email: 'old@example.test',
        message: 'Verification sent',
      }
      await page.route('**/api/v1/authentication/sign-in', (route) =>
        route.fulfill({ json: { mfa_required: true, ...challenge } }),
      )
      await page.route('**/api/v1/authentication/registration/resend', (route) =>
        route.fulfill({ json: challenge }),
      )
      let release!: () => void
      const held = new Promise<void>((resolve) => {
        release = resolve
      })
      let requests = 0
      await page.route(`**/api/v1/authentication/${endpoint}`, async (route) => {
        requests++
        expect(route.request().postDataJSON()).toEqual({
          challenge_id: 'old-challenge',
          code: '123456',
        })
        await held
        if (outcome === 'success') await route.fulfill({ json: session('old@example.test') })
        else await route.fulfill({ status: 422, json: { message: 'old verification failure' } })
      })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('/settings/security')
      await openVerification[kind](page)
      const dialog = page.getByRole('dialog')
      await dialog.locator('input[autocomplete="one-time-code"]').fill('123456')
      await dialog.locator('input[autocomplete="one-time-code"]').press('Enter')
      await expect.poll(() => requests).toBe(1)
      await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeEnabled()
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
      await expect(dialog).toBeHidden()
      await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click()
      const draft = dialog.getByLabel('Email address', { exact: true })
      await draft.fill('new-draft@example.test')
      const response = page.waitForResponse(`**/api/v1/authentication/${endpoint}`)
      release()
      await response
      await settleResponse(page)
      await expect(draft).toHaveValue('new-draft@example.test')
      await expect(dialog).toBeVisible()
      await expect(page.locator('main [role=tablist]')).toHaveCount(0)
      await expect(page.getByText('old verification failure', { exact: true })).toHaveCount(0)
      expect(requests).toBe(1)
      expect(errors).toEqual([])
    })
  }
}

for (const outcome of ['success', 'failure'] as const) {
  test(`account replacement during refresh preserves the newer session after old ${outcome}`, async ({
    page,
    context,
  }) => {
    await mockCredentials(context)
    const initial = session('account-A@example.test', 'initial-access')
    const replacement = session('account-B@example.test', 'replacement-access')
    await context.addInitScript(
      (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
      initial.refresh,
    )
    await context.route('**/api/v1/authentication/refresh', (route) =>
      route.fulfill({ json: initial }),
    )
    await context.route('**/api/v1/authentication/sign-out', (route) =>
      route.fulfill({ status: 204 }),
    )
    await context.route('**/api/v1/authentication/sign-in', (route) =>
      route.fulfill({ json: replacement }),
    )
    let release!: () => void
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    let refreshes = 0
    await page.route('**/api/v1/authentication/refresh', async (route) => {
      if (++refreshes === 1) {
        await route.fulfill({ json: initial })
        return
      }
      await held
      if (outcome === 'success')
        await route.fulfill({ json: session('account-A@example.test', 'obsolete-access') })
      else await route.fulfill({ status: 401, json: { message: 'old refresh revoked' } })
    })
    const sessionRequests: string[] = []
    await page.route('**/api/v1/account/sessions*', async (route) => {
      const authorization = route.request().headers().authorization!
      sessionRequests.push(authorization)
      // The pending destination may legitimately load again for the new account.
      if (authorization === 'Bearer replacement-access') await route.fulfill({ json: [] })
      else await route.fulfill({ status: 401, json: { message: 'initial-access expired' } })
    })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/settings/security')
    const otherTab = await context.newPage()
    await otherTab.goto('/settings/security')
    await expect(otherTab.getByText(initial.user.identity.email, { exact: true })).toBeVisible()
    await page.getByRole('tab', { name: 'Sessions', exact: true }).click()
    await expect.poll(() => refreshes).toBe(2)
    await signOut(otherTab)
    await expect(otherTab.getByRole('dialog')).toBeHidden()
    await signIn(otherTab, replacement.user.identity.email)
    await expect(otherTab.getByRole('dialog')).toBeHidden()
    await expect(page.getByText(replacement.user.identity.email, { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Delete account', exact: true }).click()
    await expect(page.getByRole('dialog').locator('input[name="password"]')).toBeVisible()
    const response = page.waitForResponse('**/api/v1/authentication/refresh')
    release()
    await response
    await settleResponse(page)
    await expect(page.getByRole('dialog').locator('input[name="password"]')).toBeVisible()
    await expect(page.getByText(replacement.user.identity.email, { exact: true })).toBeVisible()
    await expect(page.getByText('old refresh revoked', { exact: true })).toHaveCount(0)
    expect(sessionRequests.filter((header) => header === 'Bearer initial-access')).toHaveLength(1)
    expect(
      sessionRequests.every((header) =>
        ['Bearer initial-access', 'Bearer replacement-access'].includes(header),
      ),
    ).toBe(true)
    expect(refreshes).toBe(2)
    expect(errors).toEqual([])
    await otherTab.close()
  })
}

test('a closed refreshing tab causes a retryable error and recovery without signing out', async ({
  page,
  context,
}) => {
  test.setTimeout(45000)
  await mockCredentials(context)
  const initial = session('account-A@example.test', 'initial-access')
  await context.addInitScript(
    (expiry) => localStorage.setItem('refresh_expiry', JSON.stringify(expiry)),
    initial.refresh,
  )
  let refreshes = 0
  await context.route('**/api/v1/authentication/refresh', (route) => {
    refreshes++
    return route.fulfill({
      json: refreshes === 1 ? initial : session('account-A@example.test', 'recovered-access'),
    })
  })
  let sessionRequests = 0
  await context.route('**/api/v1/account/sessions*', (route) => {
    sessionRequests++
    return route.request().headers().authorization === 'Bearer recovered-access'
      ? route.fulfill({ json: [] })
      : route.fulfill({ status: 401, json: { message: 'initial-access expired' } })
  })
  await page.goto('/settings/security')
  const owner = await context.newPage()
  let ownerRefreshes = 0
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await owner.route('**/api/v1/authentication/refresh', async (route) => {
    ownerRefreshes++
    await held
    if (!owner.isClosed()) await route.fulfill({ json: initial })
  })
  await owner.goto('/settings/security')
  await expect(owner.getByText(initial.user.identity.email, { exact: true })).toBeVisible()
  const key = await page.evaluate(
    () => JSON.parse(localStorage.getItem('quickfe_auth_identity')!).key,
  )
  await owner.getByRole('tab', { name: 'Sessions', exact: true }).click()
  await expect.poll(() => ownerRefreshes).toBe(1)
  await page.getByRole('tab', { name: 'Sessions', exact: true }).click()
  await expect.poll(() => sessionRequests).toBe(2)
  await owner.close()
  release()
  await expect(
    page.getByRole('alert').getByRole('button', { name: 'Reload', exact: true }),
  ).toBeVisible({ timeout: 20000 })
  await expect(page.getByRole('button', { name: 'User avatar', exact: true })).toBeVisible()
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('quickfe_auth_identity')!).key),
  ).toBe(key)
  await page.getByRole('button', { name: 'Reload', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'Sessions', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(refreshes).toBe(2)
  expect(ownerRefreshes).toBe(1)
  expect(sessionRequests).toBe(4)
})
