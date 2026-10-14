import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { CountryDto } from '@/library/models/reference'
import { buildUser } from '@test/support/fixtures'
import { useLibraryStore } from '@/shared/stores/library'
import { useThemeStore } from '@/shared/stores/theme'
import { useLocaleStore } from '@/shared/stores/locale'
import { i18n } from '@/shared/i18n'

const routes = vi.hoisted(() => ({
  getCountries: vi.fn(),
  getGenders: vi.fn(),
  getRoles: vi.fn(),
  getStatuses: vi.fn(),
  getTimezones: vi.fn(),
}))
vi.mock('@/shared/api/routes/useLibraryRoutes', () => ({ useLibraryRoutes: () => routes }))
const previousTheme = document.documentElement.getAttribute('data-theme')
const previousLanguage = document.documentElement.lang
const previousLocale = i18n.global.locale.value
beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  for (const method of Object.values(routes)) method.mockResolvedValue([])
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  )
  vi.stubGlobal(
    'BroadcastChannel',
    class {
      postMessage = vi.fn()
      addEventListener = vi.fn()
      close = vi.fn()
    },
  )
})
afterEach(() => {
  if (previousTheme === null) document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', previousTheme)
  document.documentElement.lang = previousLanguage
  i18n.global.locale.value = previousLocale
})

describe('reference hydration and user preferences', () => {
  it('commits complete reference data and never partially overwrites existing data on failure', async () => {
    const store = useLibraryStore()
    const country = new CountryDto(buildUser().profile.region.country)
    routes.getCountries.mockResolvedValue([country])
    await store.hydrateLibrary()
    expect(store.isInitialized).toBe(true)
    expect(store.countries).toEqual([country])
    routes.getCountries.mockResolvedValue([])
    routes.getStatuses.mockRejectedValue(new Error('reference failed'))
    await expect(store.hydrateLibrary()).rejects.toThrow('reference failed')
    expect(store.countries).toEqual([country])
    store.reset()
    expect(store.countries).toEqual([])
    expect(store.isInitialized).toBe(false)
  })
  it('persists theme toggles and applies them to the document', () => {
    const store = useThemeStore()
    store.setMode('light', { broadcast: false })
    expect(store.isDark).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
    store.toggleMode()
    expect(store.mode).toBe('dark')
    expect(JSON.parse(localStorage.getItem('theme_mode')!)).toBe('dark')
    expect(store.nextMode).toBe('light')
  })
  it('updates locale, document language and persisted preference while rejecting unsupported locales', () => {
    const store = useLocaleStore()
    store.setLocale('fr', { broadcast: false })
    expect(store.locale).toBe('fr')
    expect(document.documentElement.lang).toBe('fr')
    expect(i18n.global.locale.value).toBe('fr')
    store.setLocale('unsupported' as never)
    expect(store.locale).toBe('fr')
    store.setLocale('es', { broadcast: false })
    expect(store.locale).toBe('es')
  })
})
