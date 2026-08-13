import { type Component, markRaw } from 'vue'
import { defineStore, type Store, type StoreDefinition } from 'pinia'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
type ModalStatus = 'closed' | 'open' | 'closing'

export interface ModalOptions {
  view?: Component
  props?: Record<string, unknown>
  size?: ModalSize
  persistent?: boolean
  key?: string | number
}

export interface ModalState {
  $isOpen: boolean
  $options: ModalOptions
  $status: ModalStatus
}

interface ModalGetters {
  isOpen: (state: ModalState) => boolean
  isClosing: (state: ModalState) => boolean
  getOptions: (state: ModalState) => ModalOptions
}

interface ModalActions {
  open: (options: ModalOptions) => void
  close: () => void
  closeAndWait: () => Promise<void>
  completeClose: () => void
  purge: () => void
}

function createDefaultOptions(): ModalState['$options'] {
  return {
    view: undefined,
    props: {},
    size: 'md',
    persistent: false,
  }
}

function createDefaultState(): ModalState {
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

type StoreDef = StoreDefinition<'modal', ModalState, ModalGetters, ModalActions>

export const useModalStore: StoreDef = defineStore('modal', {
  state: (): ModalState => createDefaultState(),
  getters: {
    isOpen: (state: ModalState): boolean => state.$isOpen,
    isClosing: (state: ModalState): boolean => state.$status === 'closing',
    getOptions: (state: ModalState): ModalOptions => state.$options,
  },
  actions: {
    open(options: ModalOptions): void {
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
      if (!this.$isOpen) return closePromise ?? Promise.resolve()

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

export type ModalStore = Store<'modal', ModalState, ModalGetters, ModalActions>
