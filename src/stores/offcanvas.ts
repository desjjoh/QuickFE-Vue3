import { defineStore, type Store, type StoreDefinition } from 'pinia'
import { type Component, markRaw } from 'vue'

type OffcanvasSide = 'left' | 'right' | 'top' | 'bottom'
type OffcanvasSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface OffcanvasOptions {
  view?: Component
  props?: Record<string, unknown>
  side?: OffcanvasSide
  size?: OffcanvasSize
  persistent?: boolean
  key?: string | number
}

interface OffcanvasState {
  $isOpen: boolean
  $options: OffcanvasOptions
}

interface OffcanvasGetters {
  hasView: (state: OffcanvasState) => boolean
}

interface OffcanvasActions {
  open: (options: OffcanvasOptions) => void
  close: () => void
  purge: () => void
}

function createDefaultOptions(): OffcanvasState['$options'] {
  return {
    view: undefined,
    props: {},
    size: 'md',
    side: 'left',
    persistent: false,
  }
}

function createDefaultState(): OffcanvasState {
  return {
    $isOpen: false,
    $options: createDefaultOptions(),
  }
}

type StoreDef = StoreDefinition<'offcanvas', OffcanvasState, OffcanvasGetters, OffcanvasActions>

export const useOffcanvas: StoreDef = defineStore('offcanvas', {
  state: (): OffcanvasState => createDefaultState(),
  getters: {
    hasView: (state: OffcanvasState): boolean => !!state.$options.view,
  },
  actions: {
    open(options: OffcanvasOptions): void {
      this.$options = {
        ...createDefaultOptions(),
        ...options,
        view: options.view ? markRaw(options.view) : undefined,
      }

      this.$isOpen = true
    },
    close(): void {
      this.$isOpen = false
    },
    purge(): void {
      this.$options = createDefaultOptions()
    },
  },
})

export type OffcanvasStore = Store<'offcanvas', OffcanvasState, OffcanvasGetters, OffcanvasActions>
