import { defineStore, type Store, type StoreDefinition } from 'pinia'

type ToastTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface ToastOptions {
  message: string
  tone?: ToastTone
  duration?: number
  closable?: boolean
}

export interface ToastItem {
  id: string
  message: string
  tone: ToastTone
  duration: number
  closable: boolean
}

interface ToastState {
  $toasts: ToastItem[]
}

interface ToastGetters {
  getToasts: (state: ToastState) => ToastItem[]
  hasToasts: (state: ToastState) => boolean
}

interface ToastActions {
  addToast: (newToast: ToastOptions) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const DEFAULT_DURATION = 10_000

function createToastItem(options: ToastOptions): ToastItem {
  return {
    id: crypto.randomUUID(),
    message: options.message,
    tone: options.tone ?? 'primary',
    duration: options.duration ?? DEFAULT_DURATION,
    closable: options.closable ?? true,
  }
}

function createDefaultState(): ToastState {
  return {
    $toasts: [],
  }
}

type StoreDef = StoreDefinition<'toast', ToastState, ToastGetters, ToastActions>

export const useToastStore: StoreDef = defineStore('toast', {
  state: (): ToastState => createDefaultState(),
  getters: {
    getToasts: (state: ToastState) => state.$toasts,
    hasToasts: (state: ToastState): boolean => state.$toasts.length > 0,
  },
  actions: {
    addToast(options: ToastOptions): string {
      const toast = createToastItem(options)

      this.$toasts.push(toast)

      return toast.id
    },

    removeToast(id: string): void {
      const index = this.$toasts.findIndex((toast) => toast.id === id)

      if (index === -1) return

      this.$toasts.splice(index, 1)
    },

    clearToasts(): void {
      this.$toasts = []
    },
  },
})

export type ToastStore = Store<'toast', ToastState, ToastGetters, ToastActions>
