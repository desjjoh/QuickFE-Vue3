import { shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { LOCALES } from '@/shared/i18n'

const fonts = [
  '400 16px "Nunito Sans"',
  '400 16px "Outfit"',
  '400 16px "JetBrains Mono"',
  '400 16px "Merriweather"',
  'italic 400 16px "Merriweather"',
]

export const useAssetsStore = defineStore('assets', () => {
  // Retain decoded flag images for the lifetime of the application.
  const flags = shallowRef<HTMLImageElement[]>([])
  let pending: Promise<void> | undefined

  function initialize(): Promise<void> {
    if (pending) return pending
    pending = warm()

    return pending
  }

  async function warm(): Promise<void> {
    const tasks: Promise<unknown>[] = []

    if (typeof document !== 'undefined' && typeof document.fonts?.load === 'function') {
      for (const font of fonts) tasks.push(loadFont(font))
    }

    if (typeof Image !== 'undefined') {
      flags.value = Object.values(LOCALES).map(({ flag }) => {
        const image = new Image()

        image.decoding = 'async'
        tasks.push(loadFlag(image, flag))

        return image
      })
    }

    // Asset warming is optional and must not interrupt startup or log expected failures.
    await Promise.allSettled(tasks)
  }

  async function loadFont(font: string): Promise<void> {
    await document.fonts.load(font)
  }

  async function loadFlag(image: HTMLImageElement, url: string): Promise<void> {
    image.src = url
    if (typeof image.decode === 'function') await image.decode()
  }

  return { flags, initialize }
})
