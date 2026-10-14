import type { Locator, Page } from '@playwright/test'
import { test, expect } from './fixtures'

test.use({ viewport: { width: 1600, height: 1000 } })

async function verifyFocusCycle(page: Page, dialog: Locator) {
  const controls = dialog
    .locator(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
    )
    .filter({ visible: true })
  const count = await controls.count()
  expect(count).toBeGreaterThan(1)
  await controls.last().focus()
  await page.keyboard.press('Tab')
  await expect(controls.first()).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(controls.last()).toBeFocused()
  for (let index = 0; index < count; index++) {
    await page.keyboard.press('Tab')
    await expect(controls.nth(index)).toBeFocused()
  }
  for (let index = count - 2; index >= 0; index--) {
    await page.keyboard.press('Shift+Tab')
    await expect(controls.nth(index)).toBeFocused()
  }
}

for (const mode of ['light', 'dark'] as const) {
  test(`sign-in keyboard validation, loading, rejection and focus restoration in ${mode}`, async ({
    page,
    checkAccessibility,
  }) => {
    await page.addInitScript(
      (theme) => localStorage.setItem('theme_mode', JSON.stringify(theme)),
      mode,
    )
    await page.route('**/api/v1/security/csrf', (route) =>
      route.fulfill({ json: { token: 'csrf', iat: 0, exp: 4102444800 } }),
    )
    let release!: () => void
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    let requested!: () => void
    const request = new Promise<void>((resolve) => {
      requested = resolve
    })
    await page.route('**/api/v1/authentication/sign-in', async (route) => {
      requested()
      await pending
      await route.fulfill({ status: 401, json: { message: 'Invalid credentials' } })
    })
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Sign in', exact: true })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAccessibleName('Sign in')
    const email = dialog.getByLabel('Email address', { exact: true })
    const password = dialog.getByLabel('Password', { exact: true })
    await expect(email).toBeFocused()
    await checkAccessibility('sign-in-default', '[role="dialog"]')
    await verifyFocusCycle(page, dialog)
    await email.focus()
    await page.keyboard.press('Enter')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(password).toHaveAttribute('aria-invalid', 'true')
    await checkAccessibility('sign-in-invalid', '[role="dialog"]')
    await email.fill('keyboard@example.test')
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Forgot password?' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(password).toBeFocused()
    await page.keyboard.type('kept-password')
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Show password' })).toBeFocused()
    await page.keyboard.press('Space')
    await expect(password).toHaveAttribute('type', 'text')
    await expect(password).toHaveValue('kept-password')
    await expect(password).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(password).toHaveAttribute('type', 'password')
    await password.press('Enter')
    await request
    try {
      await expect(dialog.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled()
      await checkAccessibility('sign-in-loading', '[role="dialog"]')
    } finally {
      release()
    }
    await expect(dialog).toBeHidden()
    await expect(page.getByText('Invalid credentials', { exact: true })).toBeVisible()
    await expect(trigger).toBeFocused()
    await trigger.press('Space')
    await expect(email).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })
}

test('dropdown keyboard navigation wraps, activates actions and releases Tab in both directions', async ({
  page,
  checkAccessibility,
}) => {
  await page.goto('/playground')
  const section = page.getByRole('heading', { name: 'Dropdown Menu', exact: true }).locator('..')
  const trigger = section.getByRole('button', { name: 'Options', exact: true })
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  const menu = page.getByRole('menu')
  const items = menu.getByRole('menuitem')
  await expect(items.first()).toBeFocused()
  await checkAccessibility('dropdown-open', '[role="menu"]')
  await page.keyboard.press('End')
  await expect(items.last()).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(items.first()).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(items.last()).toBeFocused()
  await page.keyboard.press('Home')
  await expect(items.first()).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(items.nth(1)).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(items.first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
  for (const key of ['Enter', 'Space']) {
    await trigger.press(key)
    await expect(menu).toBeVisible()
    await page.keyboard.press('Home')
    await page.keyboard.press(key)
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
  }
  await trigger.focus()
  await trigger.press('ArrowUp')
  await expect(items.last()).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(menu).toBeHidden()
  await expect(trigger).not.toBeFocused()
  await trigger.focus()
  await trigger.press('ArrowDown')
  await page.keyboard.press('Shift+Tab')
  await expect(menu).toBeHidden()
  await expect(trigger).not.toBeFocused()
})

test('select keyboard navigation preserves canceled values, commits selections and releases Tab', async ({
  page,
}) => {
  await page.goto('/playground')
  const section = page.getByRole('heading', { name: 'Select', exact: true }).locator('..')
  const select = section.locator('.select-field__input:not(:disabled)')
  await select.focus()
  const initial = await select.inputValue()
  await select.press('Space')
  const list = page.getByRole('listbox')
  const options = list.getByRole('option')
  const activeId = () => list.getAttribute('aria-activedescendant')
  await expect(list).toBeFocused()
  await page.keyboard.press('End')
  expect(await activeId()).toBe(await options.last().getAttribute('id'))
  await page.keyboard.press('ArrowDown')
  expect(await activeId()).toBe(await options.first().getAttribute('id'))
  await page.keyboard.press('ArrowUp')
  expect(await activeId()).toBe(await options.last().getAttribute('id'))
  await page.keyboard.press('Escape')
  await expect(select).toBeFocused()
  await expect(select).toHaveValue(initial)
  await select.press('ArrowDown')
  await expect(list).toBeFocused()
  await page.keyboard.press('End')
  const chosen = (await options.last().innerText()).trim()
  await page.keyboard.press('Enter')
  await expect(select).toHaveValue(chosen)
  await expect(select).toBeFocused()
  await select.press('ArrowUp')
  await expect(list).toBeFocused()
  expect(await activeId()).toBe(await options.last().getAttribute('id'))
  await page.keyboard.press('Home')
  const first = (await options.first().innerText()).trim()
  await page.keyboard.press('Space')
  await expect(select).toHaveValue(first)
  for (const key of ['Tab', 'Shift+Tab']) {
    await select.focus()
    await select.press('Enter')
    await expect(list).toBeFocused()
    await page.keyboard.press(key)
    await expect(list).toBeHidden()
    await expect(select).not.toBeFocused()
  }
  const disabled = section.locator('.select-field__input:disabled')
  await disabled.evaluate((element) => (element as HTMLInputElement).focus())
  await expect(disabled).not.toBeFocused()
  await expect(list).toBeHidden()
})

test('checkboxes honor keyboard toggling, readonly and disabled states; tooltips work on focus', async ({
  page,
}) => {
  await page.goto('/playground')
  const section = page.getByRole('heading', { name: 'Checkbox', exact: true }).locator('..')
  const checks = section.getByRole('checkbox')
  await checks.nth(0).focus()
  await page.keyboard.press('Space')
  await expect(checks.nth(0)).toBeChecked()
  await page.keyboard.press('Space')
  await expect(checks.nth(0)).not.toBeChecked()
  await page.keyboard.press('Tab')
  await expect(checks.nth(2)).toBeFocused()
  await page.keyboard.press('Space')
  await expect(checks.nth(2)).toBeChecked()
  await checks.nth(1).evaluate((element) => (element as HTMLInputElement).focus())
  await expect(checks.nth(1)).not.toBeFocused()
  const tooltipTrigger = page.locator('.hover__item')
  await tooltipTrigger.focus()
  const tooltip = page.getByRole('tooltip')
  await expect(tooltip).toBeVisible()
  await expect(tooltipTrigger).toHaveAttribute(
    'aria-describedby',
    (await tooltip.getAttribute('id')) ?? '',
  )
  await page.keyboard.press('Escape')
  await expect(tooltip).toBeHidden()
  await expect(tooltipTrigger).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(tooltip).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(tooltip).toBeHidden()
})

test('local tabs use one tab stop, wrap arrows and support Home and End without changing other tab groups', async ({
  page,
}) => {
  await page.goto('/playground')
  const section = page.getByRole('heading', { name: 'Tabs', exact: true }).locator('..')
  const tabs = section.getByRole('tablist').nth(1).getByRole('tab')
  const other = section.getByRole('tablist').nth(2).getByRole('tab').first()
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.last()).toHaveAttribute('tabindex', '-1')
  await tabs.first().focus()
  for (const [key, index] of [
    ['ArrowRight', 1],
    ['End', 1],
    ['ArrowLeft', 0],
    ['Home', 0],
    ['ArrowLeft', 1],
    ['ArrowRight', 0],
  ] as const) {
    await page.keyboard.press(key)
    await expect(tabs.nth(index)).toBeFocused()
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true')
    await expect(other).toHaveAttribute('aria-selected', 'true')
  }
  await page.keyboard.press('Tab')
  await expect(tabs.first()).not.toBeFocused()
  await expect(tabs.last()).not.toBeFocused()
})

test('persistent verification dialogs resist Escape and backdrop dismissal and retain rejected input', async ({
  page,
  checkAccessibility,
}) => {
  await page.route('**/api/v1/security/csrf', (route) =>
    route.fulfill({ json: { token: 'csrf', iat: 0, exp: 4102444800 } }),
  )
  await page.route('**/api/v1/authentication/sign-in', (route) =>
    route.fulfill({
      json: { mfa_required: true, challenge_id: 'challenge', expires_at: '2100-01-01T00:00:00Z' },
    }),
  )
  await page.route('**/api/v1/authentication/sign-in/mfa/verify', (route) =>
    route.fulfill({ status: 401, json: { message: 'Invalid verification code' } }),
  )
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Sign in', exact: true })
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Email address', { exact: true }).fill('keyboard@example.test')
  await dialog.getByLabel('Password', { exact: true }).fill('password')
  await dialog.getByLabel('Password', { exact: true }).press('Enter')
  const code = dialog.locator('input[autocomplete="one-time-code"]')
  await expect(code).toBeFocused()
  await checkAccessibility('persistent-verification', '[role="dialog"]')
  await verifyFocusCycle(page, dialog)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  await page.locator('.modal__backdrop').click({ position: { x: 1, y: 1 } })
  await expect(dialog).toBeVisible()
  await code.fill('123456')
  await code.press('Enter')
  await expect(dialog.getByRole('alert')).toContainText('Invalid verification code')
  await expect(code).toHaveValue('123456')
  await expect(code).toBeEnabled()
  await checkAccessibility('verification-rejected', '[role="dialog"]')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).press('Enter')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

for (const width of [390, 1600]) {
  test(`dialogs and offcanvases cycle focus and restore their trigger at ${width}px`, async ({
    page,
    checkAccessibility,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/playground')
    const modalTrigger = page
      .getByRole('heading', { name: 'Alert Dialog', exact: true })
      .locator('..')
      .getByRole('button', { name: 'Submit', exact: true })
    const offcanvasTrigger = page.getByRole('button', { name: 'Open right', exact: true })
    for (const trigger of [modalTrigger, offcanvasTrigger]) {
      await trigger.focus()
      await trigger.press('Enter')
      const dialog = page.getByRole('dialog')
      await checkAccessibility('overlay-keyboard', '[role="dialog"]')
      await verifyFocusCycle(page, dialog)
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(trigger).toBeFocused()
      await trigger.press('Space')
      await expect(dialog).toBeVisible()
      await dialog.getByRole('button', { name: 'Close', exact: true }).press('Enter')
      await expect(dialog).toBeHidden()
      await expect(trigger).toBeFocused()
    }
  })
}
