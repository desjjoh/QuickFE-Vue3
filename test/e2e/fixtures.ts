import AxeBuilder from '@axe-core/playwright'
import { test as base, expect } from '@playwright/test'
import { userFixture } from '@test/support/api-fixtures'

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
        await page.route('**/api/v1/public/library/*', (route) =>
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
      const evidencePath = testInfo.outputPath(`${state}-axe.json`)
      await writeFile(
        evidencePath,
        JSON.stringify(
          {
            ...results,
            quickfe: {
              state,
              selector,
              test: testInfo.title,
              project: testInfo.project.name,
              retry: testInfo.retry,
            },
          },
          null,
          2,
        ),
      )
      await testInfo.attach(`${state}-axe.json`, {
        path: evidencePath,
        contentType: 'application/json',
      })
      if (results.violations.length)
        testInfo.annotations.push({
          type: 'accessibility-finding',
          description: `${state}: ${results.violations.length} axe rule findings (report-only)`,
        })
    })
  },
})

export { expect } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
