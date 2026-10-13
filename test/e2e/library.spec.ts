import { expect, test } from '@playwright/test'
import { userFixture } from '../../src/shared/api/__tests__/fixtures'

test.beforeEach(async ({ page }) => {
  const references: Record<string, unknown[]> = {
    countries: [userFixture.profile.region.country],
    genders: [userFixture.profile.personal.gender],
    roles: [],
    statuses: [userFixture.status],
    timezones: [userFixture.profile.region.timezone],
  }
  await page.route('**/api/v1/library/*', (route) =>
    route.fulfill({
      json: references[new URL(route.request().url()).pathname.split('/').pop()!] ?? [],
    }),
  )
})

for (const mode of ['light', 'dark'] as const) {
  for (const width of [390, 900, 1600]) {
    test(`library overlays and JSON remain usable in ${mode} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.addInitScript(
        (theme) => localStorage.setItem('theme_mode', JSON.stringify(theme)),
        mode,
      )
      await page.goto('/playground')
      await expect(page.locator('html')).toHaveAttribute('data-theme', mode)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      const json = page.locator('.json-viewer').first()
      await json.scrollIntoViewIfNeeded()
      await expect(json).toBeVisible()
      await expect(json.locator('pre')).toHaveCSS('overflow-x', 'hidden')
      const contrast = await json.locator('.json-viewer__code-block').evaluate((element) => {
        const key = element.querySelector('.pd-key')!
        const background = getComputedStyle(element).backgroundColor
        const canvasBackground = getComputedStyle(document.documentElement).backgroundColor
        const foreground = getComputedStyle(key).color
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const context = canvas.getContext('2d')!
        const luminance = (color: string) => {
          context.clearRect(0, 0, 1, 1)
          context.fillStyle = canvasBackground
          context.fillRect(0, 0, 1, 1)
          context.fillStyle = color
          context.fillRect(0, 0, 1, 1)
          const pixels = context.getImageData(0, 0, 1, 1).data
          const values = Array.from(pixels)
            .slice(0, 3)
            .map((channel) => {
              const value = channel / 255
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
            })
          return values[0]! * 0.2126 + values[1]! * 0.7152 + values[2]! * 0.0722
        }
        const first = luminance(foreground)
        const second = luminance(background)
        return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
      })
      expect(contrast).toBeGreaterThanOrEqual(4.5)
      const trigger = page.getByRole('button', { name: 'Open right', exact: true })
      await trigger.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.locator('input')).toBeFocused()
      const panel = dialog.locator('.offcanvas__panel')
      await expect
        .poll(() => panel.evaluate((element) => element.getBoundingClientRect().left))
        .toBeGreaterThanOrEqual(-1)
      await expect
        .poll(() => panel.evaluate((element) => element.getBoundingClientRect().right))
        .toBeLessThanOrEqual(width + 1)
      for (let count = 0; count < 6; count++) {
        await page.keyboard.press('Tab')
        expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(
          true,
        )
      }
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(trigger).toBeFocused()
    })
  }
}

test('dropdowns, selects, tooltips and modal focus work with keyboard and clean up on navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/playground')
  const dropdownSection = page
    .getByRole('heading', { name: 'Dropdown Menu', exact: true })
    .locator('..')
  const trigger = dropdownSection.getByRole('button', { name: 'Options', exact: true })
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await page.keyboard.press('End')
  await expect(menu.getByRole('menuitem').last()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
  const select = page.locator('.select-field__input:not(:disabled)').last()
  await select.focus()
  await page.keyboard.press('ArrowDown')
  const list = page.getByRole('listbox')
  await expect(list).toBeVisible()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(list).toBeHidden()
  await expect(select).toBeFocused()
  await page.locator('.hover__item').hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.mouse.move(0, 0)
  await expect(page.getByRole('tooltip')).toBeHidden()
  const modalTrigger = page
    .getByRole('heading', { name: 'Alert Dialog', exact: true })
    .locator('..')
    .getByRole('button', { name: 'Submit', exact: true })
  await modalTrigger.click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  for (let count = 0; count < 5; count++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(modal).toBeHidden()
  await expect(modalTrigger).toBeFocused()
  await page.getByRole('button', { name: 'Open right', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.goto('/')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(page.getByRole('tooltip')).toHaveCount(0)
})
