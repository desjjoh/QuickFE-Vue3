import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAssetsStore } from '@/shared/stores/assets'
import { LOCALES } from '@/shared/i18n'

describe('startup asset warming', () => {
  const load = vi.fn().mockResolvedValue([])
  const decode = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    setActivePinia(createPinia())
    load.mockReset().mockResolvedValue([])
    decode.mockReset().mockResolvedValue(undefined)
    vi.stubGlobal(
      'Image',
      class {
        src = ''
        decoding = ''
        decode = decode
      },
    )
    Object.defineProperty(document, 'fonts', { configurable: true, value: { load } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'fonts')
  })

  it('loads all active families including italic emphasis and retains decoded locale flags', async () => {
    const store = useAssetsStore()
    await store.initialize()
    expect(load.mock.calls.map(([font]) => font)).toEqual([
      '400 16px "Nunito Sans"',
      '400 16px "Outfit"',
      '400 16px "JetBrains Mono"',
      '400 16px "Merriweather"',
      'italic 400 16px "Merriweather"',
    ])
    expect(store.flags.map((image) => image.src)).toEqual(
      Object.values(LOCALES).map(({ flag }) => flag),
    )
    expect(decode).toHaveBeenCalledTimes(3)
    const retained = store.flags
    await store.initialize()
    expect(store.flags).toBe(retained)
    expect(load).toHaveBeenCalledTimes(5)
    expect(decode).toHaveBeenCalledTimes(3)
  })

  it('shares in-flight initialization without delaying callers on failed assets', async () => {
    load.mockRejectedValue(new Error('font unavailable'))
    decode.mockRejectedValue(new Error('image unavailable'))
    const store = useAssetsStore()
    const first = store.initialize()
    const second = store.initialize()
    expect(load).toHaveBeenCalledTimes(5)
    expect(decode).toHaveBeenCalledTimes(3)
    await expect(first).resolves.toBeUndefined()
    await expect(second).resolves.toBeUndefined()
    expect(store.flags).toHaveLength(3)
  })

  it('tolerates synchronous font errors and still warms flags', async () => {
    load.mockImplementation(() => {
      throw new Error('unsupported font')
    })
    await expect(useAssetsStore().initialize()).resolves.toBeUndefined()
    expect(decode).toHaveBeenCalledTimes(3)
  })

  it('supports browsers without the font loading or image decoding APIs', async () => {
    Reflect.deleteProperty(document, 'fonts')
    vi.stubGlobal(
      'Image',
      class {
        src = ''
      },
    )
    const store = useAssetsStore()
    await expect(store.initialize()).resolves.toBeUndefined()
    expect(load).not.toHaveBeenCalled()
    expect(store.flags).toHaveLength(3)
  })
})
