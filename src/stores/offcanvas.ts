import { defineStore, type Store, type StoreDefinition } from 'pinia'
import { type Component, markRaw } from 'vue'

type OffcanvasSide = 'left' | 'right' | 'top' | 'bottom'
type OffcanvasSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
type OffcanvasStatus = 'closed' | 'open' | 'closing'

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
  $status: OffcanvasStatus
}

interface OffcanvasGetters {
  hasView: (state: OffcanvasState) => boolean
  isClosing: (state: OffcanvasState) => boolean
}

interface OffcanvasActions {
  open: (options: OffcanvasOptions) => void
  close: () => void
  closeAndWait: () => Promise<void>
  completeClose: () => void
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
    $status: 'closed',
  }
}

let closeResolver: (() => void) | null = null
let closePromise: Promise<void> | null = null

function getClosePromise(): Promise<void> {
  closePromise ??= new Promise((resolve) => {
    closeResolver = resolve
  })

  return closePromise
}

function resolveClose(): void {
  closeResolver?.()
  closeResolver = null
  closePromise = null
}

type StoreDef = StoreDefinition<'offcanvas', OffcanvasState, OffcanvasGetters, OffcanvasActions>

export const useOffcanvas: StoreDef = defineStore('offcanvas', {
  state: (): OffcanvasState => createDefaultState(),
  getters: {
    hasView: (state: OffcanvasState): boolean => !!state.$options.view,
    isClosing: (state: OffcanvasState): boolean => state.$status === 'closing',
  },
  actions: {
    open(options: OffcanvasOptions): void {
      this.$options = {
        ...createDefaultOptions(),
        ...options,
        view: options.view ? markRaw(options.view) : undefined,
      }

      this.$isOpen = true
      this.$status = 'open'
      resolveClose()
    },
    close(): void {
      if (!this.$isOpen) return

      getClosePromise()

      this.$isOpen = false
      this.$status = 'closing'
    },
    closeAndWait(): Promise<void> {
      if (!this.$isOpen) {
        return closePromise ?? Promise.resolve()
      }

      const promise = getClosePromise()

      this.close()

      return promise
    },
    completeClose(): void {
      this.$isOpen = false
      this.$status = 'closed'
      this.purge()
      resolveClose()
    },
    purge(): void {
      this.$options = createDefaultOptions()
    },
  },
})

export type OffcanvasStore = Store<'offcanvas', OffcanvasState, OffcanvasGetters, OffcanvasActions>
