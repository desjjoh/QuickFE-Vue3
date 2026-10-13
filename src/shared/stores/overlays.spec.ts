import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, nextTick } from 'vue'
import { mountLibrary } from '@test/support/mount'
import { useModalStore } from './modal'
import { useOffcanvas } from './offcanvas'
import { useToastStore } from './toasts'
import ModalHost from '@/library/components/modal/ModalHost.vue'
import OffcanvasHost from '@/library/components/offcanvas/OffcanvasHost.vue'

const mocks = vi.hoisted(() => ({ activate: vi.fn(), deactivate: vi.fn() }))
vi.mock('focus-trap', () => ({ createFocusTrap: () => mocks }))
beforeEach(() => setActivePinia(createPinia()))
const View = defineComponent({
  props: ['message'],
  render() {
    return h('button', this.message)
  },
})

describe('overlay store state machines', () => {
  it.each([useModalStore, useOffcanvas])(
    'waits for transition completion, shares pending close and clears retained data',
    async (useStore) => {
      const store = useStore()
      store.open({ view: View, key: 'one', props: { message: 'Content' } })
      const closing = store.closeAndWait()
      expect(store.isClosing).toBe(true)
      const otherWaiter = store.closeAndWait()
      const settled = vi.fn()
      void closing.then(settled)
      await Promise.resolve()
      expect(settled).not.toHaveBeenCalled()
      store.completeClose()
      await closing
      await otherWaiter
      expect(store.isClosing).toBe(false)
      expect(store.$options.view).toBeUndefined()
      expect(store.$options.props).toEqual({})
      await store.closeAndWait()
      store.close()
      expect(store.isClosing).toBe(false)
    },
  )
  it.each([useModalStore, useOffcanvas])(
    'allows replacing a closing view and resets omitted options',
    async (useStore) => {
      const store = useStore()
      store.open({ view: View, persistent: true, key: 'one' })
      const closing = store.closeAndWait()
      store.open({ view: View, key: 'two' })
      await closing
      expect(store.$isOpen).toBe(true)
      expect(store.$options.key).toBe('two')
      expect(store.$options.persistent).toBe(false)
      store.completeClose()
    },
  )
  it('keeps distinct toast IDs, preserves explicit zero duration, and ignores removal of missing IDs', () => {
    const store = useToastStore()
    const one = store.addToast({ message: 'One', duration: 0, closable: false })
    const two = store.addToast({ message: 'Two', tone: 'danger' })
    expect(one).not.toBe(two)
    expect(store.getToasts[0]).toMatchObject({ duration: 0, closable: false })
    store.removeToast('missing')
    expect(store.getToasts).toHaveLength(2)
    store.removeToast(one)
    expect(store.getToasts.map((toast) => toast.id)).toEqual([two])
    store.clearToasts()
    expect(store.hasToasts).toBe(false)
  })
})

describe('overlay host composition and cleanup', () => {
  it.each([
    [ModalHost, useModalStore, '.modal__backdrop'],
    [OffcanvasHost, useOffcanvas, '.offcanvas__backdrop'],
  ] as const)(
    'renders dialog content and protects persistent views from dismissal',
    async (Host, useStore, backdrop) => {
      const wrapper = mountLibrary(Host)
      const store = useStore()
      store.open({ view: View, key: 'view', persistent: true, props: { message: 'Protected' } })
      await nextTick()
      await nextTick()
      expect(document.querySelector('[role=dialog]')?.textContent).toContain('Protected')
      expect(document.querySelector('[aria-modal=true]')).not.toBeNull()
      document.querySelector<HTMLElement>(backdrop)!.click()
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(store.$isOpen).toBe(true)
      store.open({ view: View, key: 'dismissible' })
      await nextTick()
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(store.$isOpen).toBe(false)
      wrapper.unmount()
      expect(mocks.deactivate).toHaveBeenCalled()
      store.completeClose()
      expect(document.querySelector('[role=dialog]')).toBeNull()
    },
  )
})
