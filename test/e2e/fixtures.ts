import AxeBuilder from '@axe-core/playwright'
import { test as base, expect } from '@playwright/test'
import { userFixture } from '../../src/shared/api/__tests__/fixtures'

type AccessibilityCheck = (state: string, selector?: string) => Promise<void>

export const test = base.extend<{ checkAccessibility: AccessibilityCheck; referenceData: void }>({
  referenceData: [
    async ({ page }, use) => {
      if (process.env.QUICKAPI_E2E_LIVE !== '1') {
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
      }
      await use()
    },
    { auto: true },
  ],
  checkAccessibility: async ({ page }, use, testInfo) => {
    await use(async (state, selector) => {
      if (selector) await expect(page.locator(selector)).toBeVisible()
      await page.evaluate(async () => {
        await document.fonts.ready
        const nextFrame = () =>
          new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        await nextFrame()
        await nextFrame()
        await Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => undefined)),
        )
        await nextFrame()
        await nextFrame()
      })
      const scan = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      for (const dialog of await page.getByRole('dialog').all())
        await expect(dialog).toHaveAccessibleName(/\S/)
      if (selector) scan.include(selector)
      const results = await scan.analyze()
      await testInfo.attach(`${state}-axe.json`, {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      })
      expect(results.violations, `Accessibility violations in ${state}`).toEqual([])
    })
  },
})

export { expect } from '@playwright/test'
