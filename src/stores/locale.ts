import { defineStore, type Store, type StoreDefinition } from 'pinia'

import { FALLBACK_LOCALE, i18n, LOCALES, STORAGE, type AppLocales } from '@/i18n'

interface LocaleState {
  $locale: AppLocales
}

interface LocaleGetters {
  locale: (state: LocaleState) => AppLocales
}

interface LocaleActions {
  initialize: () => void
  setLocale: (locale: AppLocales, options?: BroadcastOptions) => void
}

interface BroadcastOptions {
  broadcast?: boolean
}

interface LocaleBroadcastMessage {
  type: 'locale:changed'
  source: string
  locale: AppLocales
}

const LOCALE_CHANNEL_NAME = 'quickfe-locale'
const TAB_ID = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36)

let localeChannel: BroadcastChannel | null = null
let channelInitialized = false

function isAppLocale(locale: string | null | undefined): locale is AppLocales {
  return !!locale && locale in LOCALES
}

function getInitialLocale(): AppLocales {
  const activeLocale = i18n.global.locale.value
  if (isAppLocale(activeLocale)) return activeLocale

  const storedLocale = STORAGE.getItem()
  if (isAppLocale(storedLocale)) return storedLocale

  return FALLBACK_LOCALE
}

function applyLocale(locale: AppLocales): void {
  i18n.global.locale.value = locale
}

function getLocaleChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null

  localeChannel ??= new BroadcastChannel(LOCALE_CHANNEL_NAME)
  return localeChannel
}

function cloneBroadcastMessage(message: LocaleBroadcastMessage): LocaleBroadcastMessage {
  return JSON.parse(JSON.stringify(message)) as LocaleBroadcastMessage
}

function broadcast(message: Omit<LocaleBroadcastMessage, 'source'>): void {
  const channel = getLocaleChannel()
  if (!channel) return

  channel.postMessage(cloneBroadcastMessage({ ...message, source: TAB_ID }))
}

function initializeChannel(store: LocaleStore): void {
  if (channelInitialized) return

  const channel = getLocaleChannel()
  if (!channel) return

  channelInitialized = true
  channel.addEventListener('message', (event: MessageEvent<LocaleBroadcastMessage>) => {
    const message = event.data
    if (message.source === TAB_ID || message.type !== 'locale:changed') return

    store.setLocale(message.locale, { broadcast: false })
  })
}

function createDefaultState(): LocaleState {
  return {
    $locale: getInitialLocale(),
  }
}

type StoreDef = StoreDefinition<'locale', LocaleState, LocaleGetters, LocaleActions>

export const useLocaleStore: StoreDef = defineStore('locale', {
  state: (): LocaleState => createDefaultState(),
  getters: {
    locale: (state: LocaleState): AppLocales => state.$locale,
  },
  actions: {
    initialize(): void {
      initializeChannel(this)

      const locale = getInitialLocale()

      this.$locale = locale
      STORAGE.saveItem(locale)
      applyLocale(locale)
    },

    setLocale(locale: AppLocales, options: BroadcastOptions = {}): void {
      initializeChannel(this)

      if (!isAppLocale(locale)) return

      this.$locale = locale
      STORAGE.saveItem(locale)
      applyLocale(locale)

      if (options.broadcast ?? true) broadcast({ type: 'locale:changed', locale })
    },
  },
})

export type LocaleStore = Store<'locale', LocaleState, LocaleGetters, LocaleActions>
