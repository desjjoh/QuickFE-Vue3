import { createI18n } from 'vue-i18n'

import { useLocalStorageUtil, type ILocalStorageUtil } from '@/shared/hooks/useLocalStorage'

import en from './locales/en'
import es from './locales/es'
import fr from './locales/fr'

const messages = {
  en,
  es,
  fr,
} as const

export type AppLocales = keyof typeof messages

export const LOCALES: { [id: string]: { display: string; key: AppLocales; flag: string } } = {
  en: {
    display: 'English',
    key: 'en',
    flag: '/assets/flags/united-kingdom.svg',
  },
  es: {
    display: 'Español',
    key: 'es',
    flag: '/assets/flags/spain.svg',
  },
  fr: {
    display: 'Français',
    key: 'fr',
    flag: '/assets/flags/france.svg',
  },
}

export const STORAGE_KEY: string = 'i18n-locale'
export const STORAGE: ILocalStorageUtil<AppLocales> = useLocalStorageUtil<AppLocales>(STORAGE_KEY)
export const FALLBACK_LOCALE: AppLocales = 'en'

function resolveInitialLocale(): AppLocales {
  const stored = STORAGE.getItem()

  if (stored && stored in messages) return stored as AppLocales

  return FALLBACK_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  warnHtmlMessage: false,
  locale: resolveInitialLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages,
})

export function setLocale(locale: AppLocales) {
  i18n.global.locale.value = locale
  STORAGE.saveItem(locale)
}
