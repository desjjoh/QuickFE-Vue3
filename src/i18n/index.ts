import { createI18n } from 'vue-i18n'

import { useLocalStorageUtil, type ILocalStorageUtil } from '@/helpers/localstorage'

import en from './locales/en'
// import fr from './locales/fr'

const messages = {
  en: en,
  // fr: fr,
} as const

export type AppLocales = keyof typeof messages

export const STORAGE: ILocalStorageUtil<AppLocales> = useLocalStorageUtil<AppLocales>('i18n-locale')
export const FALLBACK_LOCALE: AppLocales = 'en'

function resolveInitialLocale(): AppLocales {
  const stored = STORAGE.getItem()

  if (stored && stored in messages) return stored as AppLocales

  return FALLBACK_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: resolveInitialLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages,
})

export function setLocale(locale: AppLocales) {
  i18n.global.locale.value = locale
  STORAGE.saveItem(locale)
}
