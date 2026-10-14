// Inventory traversal selects states and computes size-dependent thresholds.
/* eslint playwright/no-conditional-in-test: "off" */
import { writeFile } from 'node:fs/promises'
import { APCAcontrast, fontLookupAPCA, sRGBtoY } from 'apca-w3'
import { expect, test } from './fixtures'

// CSS evidence from rendered production components, not a second theme implementation.
const layers = [
  { name: 'page', token: '--color-bg-canvas', step: 1 },
  { name: 'card', token: '--color-bg-page', step: 2 },
  { name: 'modal', token: '--color-bg-surface', step: 3 },
] as const

for (const theme of ['light', 'dark'] as const) {
  for (const layer of layers) {
    test(`contrast inventory: ${theme} / ${layer.name} / neutral ${layer.step}`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(90_000)
      await page.setViewportSize({ width: 1600, height: 1000 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme_mode', JSON.stringify(mode)),
        theme,
      )
      await page.goto('/playground')
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      await expect(page.getByRole('heading', { name: 'Link Button', exact: true })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const samples = await page.evaluate((backgroundToken) => {
        const definitions = [
          { heading: 'Link', kind: 'link', selector: 'a[class*="tone-"]' },
          { heading: 'Link Button', kind: 'link-button', selector: 'button.button-link' },
          { heading: 'Button', kind: 'button', selector: 'button[class*="variant-"]' },
          { heading: 'Badge', kind: 'badge', selector: '.badge' },
          { heading: 'Avatar', kind: 'avatar', selector: '.avatar__item[class*="tone-"]' },
        ]
        const root = document.createElement('section')
        root.id = 'contrast-inventory'
        root.style.cssText = `position:fixed;inset:0;z-index:99999;overflow:auto;padding:24px;background:var(${backgroundToken});display:flex;flex-wrap:wrap;align-content:flex-start;gap:16px;`
        root.setAttribute('aria-label', 'Contrast inventory')
        const samples: { id: string; kind: string; tone: string; variant: string }[] = []
        for (const definition of definitions) {
          const heading = Array.from(document.querySelectorAll('h3')).find(
            (element) => element.textContent?.trim() === definition.heading,
          )
          if (!heading?.parentElement) throw new Error(`Missing ${definition.heading} examples`)
          const seen = new Set<string>()
          for (const original of heading.parentElement.querySelectorAll(definition.selector)) {
            const tone = Array.from(original.classList).find((value) => value.startsWith('tone-'))
            const variant =
              Array.from(original.classList).find((value) => value.startsWith('variant-')) ?? 'text'
            const key = `${tone}/${variant}`
            if (!tone || seen.has(key) || !original.textContent?.trim()) continue
            seen.add(key)
            const element = original.cloneNode(true) as HTMLElement
            element.id = `contrast-${samples.length}`
            element.tabIndex = 0
            const cell = document.createElement('div')
            cell.style.cssText = 'padding:12px;min-width:180px;'
            cell.append(element)
            root.append(cell)
            samples.push({ id: element.id, kind: definition.kind, tone, variant })
          }
        }
        document.body.append(root)
        const tones = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
        // The playground only demonstrates two avatar tones; reuse its production
        // samples with the other supported tone classes rather than omit those palettes.
        for (const sample of [...samples].filter(
          (item) => item.kind === 'avatar' && item.tone === 'tone-primary',
        )) {
          for (const tone of tones.filter((item) => item !== 'primary' && item !== 'neutral')) {
            const original = root.querySelector(`#${sample.id}`)!
            const cell = original.parentElement!.cloneNode(true) as HTMLElement
            const element = cell.firstElementChild as HTMLElement
            element.id = `contrast-${samples.length}`
            element.classList.replace('tone-primary', `tone-${tone}`)
            root.append(cell)
            samples.push({ ...sample, id: element.id, tone: `tone-${tone}` })
          }
        }
        const textTokens = [
          ...['primary', 'secondary', 'tertiary', 'muted'].map((tone) => ({
            kind: 'text-token',
            tone,
            token: `--color-text-${tone}`,
          })),
          ...tones.flatMap((tone) =>
            [11, 12].map((step) => ({
              kind: 'tone-text',
              tone: `tone-${tone}-step-${step}`,
              token: `--color-theme-${tone}-theme-${step}`,
            })),
          ),
        ]
        for (const text of textTokens) {
          if (!getComputedStyle(root).getPropertyValue(text.token).trim())
            throw new Error(`Missing text token ${text.token}`)
          for (const size of [12, 14]) {
            for (const weight of [400, 600]) {
              const element = document.createElement('span')
              element.id = `contrast-${samples.length}`
              element.style.cssText = `color:var(${text.token});font-size:${size}px;font-weight:${weight};padding:12px;`
              element.textContent = `${text.tone}: sample text`
              root.append(element)
              samples.push({
                id: element.id,
                kind: text.kind,
                tone: text.tone,
                variant: `${size}px-${weight}`,
              })
            }
          }
        }
        return samples
      }, layer.token)
      for (const kind of ['link', 'link-button', 'button', 'badge', 'avatar'])
        expect(samples.filter((sample) => sample.kind === kind).length, kind).toBeGreaterThan(0)
      expect(samples.filter((sample) => sample.kind === 'link')).toHaveLength(6)
      expect(samples.filter((sample) => sample.kind === 'link-button')).toHaveLength(6)
      expect(samples.filter((sample) => sample.kind === 'button')).toHaveLength(30)
      expect(samples.filter((sample) => sample.kind === 'badge')).toHaveLength(24)
      expect(samples.filter((sample) => sample.kind === 'avatar')).toHaveLength(12)
      expect(samples.filter((sample) => sample.kind === 'text-token')).toHaveLength(16)
      expect(samples.filter((sample) => sample.kind === 'tone-text')).toHaveLength(48)

      const rows = []
      for (const state of ['default', 'hover', 'focus'] as const) {
        for (const sample of samples) {
          // Every interactive tone exercises pseudo states; static text is measured at rest.
          if (state !== 'default' && !['link', 'link-button', 'button'].includes(sample.kind))
            continue
          const control = page.locator(`#${sample.id}`)
          if (state === 'hover') await control.hover()
          if (state === 'focus') {
            await page.mouse.move(1590, 990)
            await control.focus()
          }
          const measured = await control.evaluate(async (element) => {
            await Promise.all(
              element
                .getAnimations({ subtree: true })
                .map((animation) => animation.finished.catch(() => undefined)),
            )
            const label =
              element.querySelector('.button__label, .badge__label, .avatar__fallback') ?? element
            const style = getComputedStyle(label)
            const canvas = document.createElement('canvas')
            canvas.width = canvas.height = 1
            const context = canvas.getContext('2d')!
            const ancestors: Element[] = []
            for (let parent: Element | null = label; parent; parent = parent.parentElement)
              ancestors.unshift(parent)
            context.fillStyle = '#fff'
            context.fillRect(0, 0, 1, 1)
            for (const ancestor of ancestors) {
              const background = getComputedStyle(ancestor)
              if (background.backgroundImage !== 'none' || background.opacity !== '1')
                throw new Error('Gradient/opacity needs a separate contrast measurement')
              context.fillStyle = background.backgroundColor
              context.fillRect(0, 0, 1, 1)
            }
            const background = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3)
            context.fillStyle = style.color
            context.fillRect(0, 0, 1, 1)
            const foreground = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3)
            return {
              background,
              foreground,
              fontSize: parseFloat(style.fontSize),
              fontWeight: Number(style.fontWeight),
              fontFamily: style.fontFamily,
            }
          })
          const luminance = (rgb: number[]) => {
            const channels = rgb.map((channel) => {
              const value = channel / 255
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
            })
            return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
          }
          const a = luminance(measured.foreground)
          const b = luminance(measured.background)
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
          const required =
            measured.fontSize >= 24 || (measured.fontSize >= 56 / 3 && measured.fontWeight >= 700)
              ? 3
              : 4.5
          const lc = APCAcontrast(sRGBtoY(measured.foreground), sRGBtoY(measured.background))
          const referenceMinimumSize = fontLookupAPCA(lc)[Math.round(measured.fontWeight / 100)]
          expect(Number.isFinite(ratio) && Number.isFinite(lc)).toBe(true)
          rows.push({
            ...sample,
            state,
            ...measured,
            wcagRatio: ratio,
            wcagRequired: required,
            wcagPass: ratio >= required,
            apcaLc: lc,
            apcaReferenceMinimumSize: referenceMinimumSize,
            apcaReferencePass:
              typeof referenceMinimumSize === 'number' && measured.fontSize >= referenceMinimumSize,
          })
        }
      }
      for (const link of rows.filter((row) => row.kind === 'link')) {
        const button = rows.find(
          (row) => row.kind === 'link-button' && row.tone === link.tone && row.state === link.state,
        )
        expect(button?.foreground, `${link.tone}/${link.state} link parity`).toEqual(
          link.foreground,
        )
      }
      const findings = rows.filter((row) => !row.wcagPass)
      const report = {
        theme,
        layer,
        policy:
          'Contrast inventory only; failures are findings, not accepted exceptions or compliance claims.',
        apcaNote: 'Reference typography lookup, not validation of Nunito Sans font metrics.',
        sampleCount: rows.length,
        wcagFindings: findings.length,
        rows,
      }
      const reportPath = testInfo.outputPath('contrast-inventory.json')
      await writeFile(reportPath, JSON.stringify(report, null, 2))
      await testInfo.attach('contrast-inventory.json', {
        path: reportPath,
        contentType: 'application/json',
      })
      await testInfo.attach('contrast-inventory.md', {
        body: `# ${theme} / ${layer.name} / neutral step ${layer.step}\n\n${rows.length} measurements; ${findings.length} WCAG contrast findings. APCA is reference-font guidance only.\n\n| Component | Tone | Variant | State | Size/weight | WCAG ratio | Required | APCA Lc |\n|---|---|---|---|---|---|---|---|\n${findings.map((row) => `| ${row.kind} | ${row.tone} | ${row.variant} | ${row.state} | ${row.fontSize}px/${row.fontWeight} | ${row.wcagRatio.toFixed(2)} | ${row.wcagRequired} | ${row.apcaLc.toFixed(2)} |`).join('\n')}\n`,
        contentType: 'text/markdown',
      })
    })
  }
}
