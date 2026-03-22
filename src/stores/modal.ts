import { type Component, markRaw } from 'vue'
import { defineStore } from 'pinia'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalOptions {
  view?: Component
  props?: Record<string, unknown>
  size?: ModalSize
  persistent?: boolean
  key?: number | string
}

export interface ModalState {
  isOpen: boolean
  options: {
    view?: Component
    props?: Record<string, unknown>
    size: ModalSize
    persistent: boolean
    key?: number | string
  }
}

function createDefaultOptions(): ModalState['options'] {
  return {
    view: undefined,
    props: undefined,
    size: 'md',
    persistent: false,
    key: undefined,
  }
}

function createDefaultState(): ModalState {
  return {
    isOpen: false,
    options: createDefaultOptions(),
  }
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => createDefaultState(),
  actions: {
    openModal(options: ModalOptions): void {
      this.options = {
        ...createDefaultOptions(),
        ...options,
        view: options.view ? markRaw(options.view) : undefined,
      }

      this.isOpen = true
    },

    closeModal(): void {
      this.isOpen = false
    },

    purgeModal(): void {
      this.options = createDefaultOptions()
    },
  },
})
