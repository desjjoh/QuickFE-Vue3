import { defineStore, type Store, type StoreDefinition } from 'pinia'

import { useLocalStorageUtil, type ILocalStorageUtil } from '@/shared/hooks/useLocalStorage'

type ThemeMode = 'light' | 'dark'

const THEME_ATTRIBUTE = 'data-theme'
const THEME_CHANNEL_NAME = 'quickfe-theme'
const TAB_ID = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36)

interface ThemeState {
  $mode: ThemeMode
}

interface ThemeGetters {
  mode: (state: ThemeState) => ThemeMode
  isDark: (state: ThemeState) => boolean
  nextMode: (state: ThemeState) => ThemeMode
}

interface ThemeActions {
  initialize: () => void
  setMode: (mode: ThemeMode, options?: BroadcastOptions) => void
  toggleMode: () => void
}

interface BroadcastOptions {
  broadcast?: boolean
}

interface ThemeBroadcastMessage {
  type: 'theme:changed'
  source: string
  mode: ThemeMode
}

const storage: ILocalStorageUtil<ThemeMode> = useLocalStorageUtil<ThemeMode>('theme_mode')

let themeChannel: BroadcastChannel | null = null
let channelInitialized = false

function isThemeMode(mode: string | null | undefined): mode is ThemeMode {
  return mode === 'light' || mode === 'dark'
}

function getPreferredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function getDocumentMode(): ThemeMode | null {
  if (typeof document === 'undefined') return null

  const mode = document.documentElement.getAttribute(THEME_ATTRIBUTE)
  return isThemeMode(mode) ? mode : null
}

function getInitialMode(): ThemeMode {
  const documentMode = getDocumentMode()
  if (documentMode) return documentMode

  const savedMode = storage.getItem()
  return savedMode ?? getPreferredMode()
}

function applyMode(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode
}

function getThemeChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null

  themeChannel ??= new BroadcastChannel(THEME_CHANNEL_NAME)
  return themeChannel
}

function cloneBroadcastMessage(message: ThemeBroadcastMessage): ThemeBroadcastMessage {
  return JSON.parse(JSON.stringify(message)) as ThemeBroadcastMessage
}

function broadcast(message: Omit<ThemeBroadcastMessage, 'source'>): void {
  const channel = getThemeChannel()
  if (!channel) return

  channel.postMessage(cloneBroadcastMessage({ ...message, source: TAB_ID }))
}

function initializeChannel(store: ThemeStore): void {
  if (channelInitialized) return

  const channel = getThemeChannel()
  if (!channel) return

  channelInitialized = true
  channel.addEventListener('message', (event: MessageEvent<ThemeBroadcastMessage>) => {
    const message = event.data
    if (message.source === TAB_ID || message.type !== 'theme:changed') return

    store.setMode(message.mode, { broadcast: false })
  })
}

function createDefaultState(): ThemeState {
  return {
    $mode: getInitialMode(),
  }
}

type StoreDef = StoreDefinition<'theme', ThemeState, ThemeGetters, ThemeActions>

export const useThemeStore: StoreDef = defineStore('theme', {
  state: (): ThemeState => createDefaultState(),
  getters: {
    mode: (state: ThemeState): ThemeMode => state.$mode,
    isDark: (state: ThemeState): boolean => state.$mode === 'dark',
    nextMode: (state: ThemeState): ThemeMode => (state.$mode === 'dark' ? 'light' : 'dark'),
  },
  actions: {
    initialize(): void {
      initializeChannel(this)

      const mode = getInitialMode()

      this.$mode = mode
      storage.saveItem(mode)
      applyMode(mode)
    },

    setMode(mode: ThemeMode, options: BroadcastOptions = {}): void {
      initializeChannel(this)

      this.$mode = mode
      storage.saveItem(mode)
      applyMode(mode)

      if (options.broadcast ?? true) broadcast({ type: 'theme:changed', mode })
    },

    toggleMode(): void {
      this.setMode(this.nextMode)
    },
  },
})

export type { ThemeMode }
export type ThemeStore = Store<'theme', ThemeState, ThemeGetters, ThemeActions>
