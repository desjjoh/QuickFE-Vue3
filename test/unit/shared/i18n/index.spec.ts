import { afterEach, describe, expect, it, vi } from 'vitest'

const previousLanguage = document.documentElement.lang
afterEach(() => {
  document.documentElement.lang = previousLanguage
})

describe('locale startup recovery', () => {
  it.each(['{broken', '"unsupported"', '"toString"', '"__proto__"', 'true', '{}', '[]', 'null'])(
    'recovers saved locale %s during module initialization',
    async (raw) => {
      vi.resetModules()
      localStorage.setItem('i18n-locale', raw)
      const { i18n, setLocale } = await import('@/shared/i18n')
      expect(i18n.global.locale.value).toBe('en')
      expect(localStorage.getItem('i18n-locale')).toBeNull()
      setLocale('unsupported' as never)
      expect(i18n.global.locale.value).toBe('en')
      setLocale('es')
      expect(i18n.global.locale.value).toBe('es')
      expect(JSON.parse(localStorage.getItem('i18n-locale')!)).toBe('es')
    },
  )
  it('hydrates a valid locale without touching unrelated preferences', async () => {
    vi.resetModules()
    localStorage.setItem('i18n-locale', '"fr"')
    localStorage.setItem('theme_mode', '"dark"')
    const { i18n } = await import('@/shared/i18n')
    expect(i18n.global.locale.value).toBe('fr')
    expect(localStorage.getItem('theme_mode')).toBe('"dark"')
  })
  it('starts with the fallback locale when the storage getter is unavailable', async () => {
    vi.resetModules()
    const getter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    try {
      const { i18n } = await import('@/shared/i18n')
      expect(i18n.global.locale.value).toBe('en')
    } finally {
      getter.mockRestore()
    }
  })
})
