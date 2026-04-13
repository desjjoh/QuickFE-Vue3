import { type Component, markRaw } from 'vue'
import { defineStore, type Store, type StoreDefinition } from 'pinia'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

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
}

interface ModalGetters {
  isOpen: (state: ModalState) => boolean
  getOptions: (state: ModalState) => ModalOptions
}

interface ModalActions {
  open: (options: ModalOptions) => void
  close: () => void
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
  }
}

type StoreDef = StoreDefinition<'modal', ModalState, ModalGetters, ModalActions>

export const useModalStore: StoreDef = defineStore('modal', {
  state: (): ModalState => createDefaultState(),
  getters: {
    isOpen: (state: ModalState): boolean => state.$isOpen,
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
    },

    close(): void {
      this.$isOpen = false
    },

    purge(): void {
      this.$options = createDefaultOptions()
    },
  },
})

export type ModalStore = Store<'modal', ModalState, ModalGetters, ModalActions>
