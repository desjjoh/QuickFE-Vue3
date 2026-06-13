import { defineStore, type Store, type StoreDefinition } from 'pinia'

import { useLocalStorageUtil, type ILocalStorageUtil } from '@/shared/hooks/useLocalStorage'

type ThemeMode = 'light' | 'dark'

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
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const storage: ILocalStorageUtil<ThemeMode> = useLocalStorageUtil<ThemeMode>('theme_mode')

function getPreferredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyMode(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode
}

function createDefaultState(): ThemeState {
  return {
    $mode: 'dark',
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
      const savedMode = storage.getItem()
      const mode = savedMode ?? getPreferredMode()

      this.$mode = mode
      applyMode(mode)
    },

    setMode(mode: ThemeMode): void {
      this.$mode = mode
      storage.saveItem(mode)
      applyMode(mode)
    },

    toggleMode(): void {
      this.setMode(this.nextMode)
    },
  },
})

export type { ThemeMode }
export type ThemeStore = Store<'theme', ThemeState, ThemeGetters, ThemeActions>
