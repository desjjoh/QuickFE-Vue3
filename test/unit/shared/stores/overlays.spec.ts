import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, nextTick } from 'vue'
import { mountLibrary } from '@test/support/mount'
import { useModalStore } from '@/shared/stores/modal'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useToastStore } from '@/shared/stores/toasts'
import ModalHost from '@/library/components/modal/ModalHost.vue'
import OffcanvasHost from '@/library/components/offcanvas/OffcanvasHost.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import { deferred, useTestClock } from '@test/support/async'
import { flushPromises } from '@vue/test-utils'

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
  it('rotates offcanvas ownership even when reopening the same keyed view', () => {
    const store = useOffcanvas()
    store.open({ view: View, key: 'same' })
    const first = store.$instanceKey
    store.open({ view: View, key: 'same' })
    expect(store.$instanceKey).not.toBe(first)
    expect(store.isOpen).toBe(true)
  })

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
  it('names pending async offcanvas content and ignores the old closing transition after replacement', async () => {
    const clock = useTestClock()
    const wait = deferred<void>()
    const AsyncView = defineComponent({
      async setup() {
        await wait.promise
        return () => h('p', 'Resolved panel')
      },
    })
    const wrapper = mountLibrary(OffcanvasHost, { global: { stubs: { transition: false } } })
    const store = useOffcanvas()
    store.open({ view: AsyncView, persistent: true })
    await flushPromises()
    const dialog = document.querySelector('[role=dialog]')!
    const status = dialog.querySelector('[role=status]')!
    expect(status.textContent).toContain('Loading')
    expect(status.id).toBe(dialog.getAttribute('aria-labelledby'))
    store.close()
    await flushPromises()
    store.open({ view: View, key: 'replacement', props: { message: 'Replacement panel' } })
    await flushPromises()
    wait.resolve()
    await clock.advance(400)
    expect(store.isOpen).toBe(true)
    expect(store.$options.key).toBe('replacement')
    expect(document.querySelector('[role=dialog]')?.textContent).toContain('Replacement panel')
    wrapper.unmount()
  })

  it.each([
    [ModalHost, useModalStore],
    [OffcanvasHost, useOffcanvas],
  ] as const)(
    'names the dialog and restores focus before resolving a replacement, tolerating removed triggers',
    async (Host, useStore) => {
      const clock = useTestClock()
      const trigger = document.createElement('button')
      document.body.append(trigger)
      trigger.focus()
      const wrapper = mountLibrary(Host, { global: { stubs: { transition: false } } })
      const store = useStore()
      const TitledView = defineComponent({ render: () => h(FormLayout, { title: 'Named dialog' }) })
      store.open({ view: TitledView })
      await flushPromises()
      await clock.advance(400)
      const dialog = document.querySelector('[role=dialog]')!
      expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe(
        'Named dialog',
      )
      const closing = store.closeAndWait().then(() => expect(document.activeElement).toBe(trigger))
      await flushPromises()
      await clock.advance(400)
      await closing
      store.open({ view: TitledView })
      await flushPromises()
      trigger.remove()
      expect(() => wrapper.unmount()).not.toThrow()
      await clock.advance(400)
      const unopened = mountLibrary(Host)
      useStore().purge()
      unopened.unmount()
    },
  )
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
      expect(document.querySelector('[aria-label="Close"]')).toBeNull()
      store.open({ view: View, key: 'dismissible' })
      await nextTick()
      const consumed = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
      consumed.preventDefault()
      document.dispatchEvent(consumed)
      expect(store.$isOpen).toBe(true)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(store.$isOpen).toBe(false)
      store.open({ view: View, key: 'backdrop-dismissal' })
      await nextTick()
      document.querySelector<HTMLElement>(backdrop)!.click()
      expect(store.$isOpen).toBe(false)
      wrapper.unmount()
      expect(mocks.deactivate).toHaveBeenCalled()
      store.completeClose()
      expect(document.querySelector('[role=dialog]')).toBeNull()
    },
  )
})
