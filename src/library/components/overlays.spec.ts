import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mountLibrary } from '@test/support/mount'
import { useTestClock } from '@test/support/async'
import BaseTooltip from './tooltips/BaseTooltip.vue'
import BaseDropdown from './dropdowns/BaseDropdown.vue'
import MenuButton from './dropdowns/MenuButton.vue'
import BaseToast from './toasts/BaseToast.vue'

const trap = vi.hoisted(() => ({ create: vi.fn(), activate: vi.fn(), deactivate: vi.fn() }))
const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})
afterEach(() => {
  if (scrollDescriptor)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollDescriptor)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})
vi.mock('focus-trap', () => ({
  createFocusTrap: (...args: unknown[]) => {
    trap.create(...args)
    return trap
  },
}))
vi.mock('@/shared/hooks/useFloatingOverlay', () => ({
  useFloatingOverlay: () => ({
    floatingStyles: ref({}),
    resolvedSide: ref('bottom'),
    resolvedAlign: ref('start'),
    middlewareData: ref({}),
  }),
}))

describe('tooltip, dropdown and toast lifecycle', () => {
  it('preserves keyboard focus after entry, wraps enabled menu items and releases Tab', async () => {
    const clock = useTestClock()
    const wrapper = mountLibrary(BaseDropdown, {
      global: { stubs: { transition: false } },
      attachTo: document.body,
      slots: {
        trigger: ({ toggle, triggerAttrs }) =>
          h('button', { ...triggerAttrs, onClick: toggle }, 'Options'),
        default: () => [
          h(MenuButton, {}, () => 'First'),
          h(MenuButton, { disabled: true }, () => 'Disabled'),
          h(MenuButton, {}, () => 'Last'),
        ],
      },
    })
    await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' })
    await clock.advance(100)
    const menu = document.querySelector<HTMLElement>('[role=menu]')!
    const items = menu.querySelectorAll<HTMLButtonElement>('[role=menuitem]:not([disabled])')
    expect(document.activeElement).toBe(items[0])
    const options = trap.create.mock.lastCall![1]
    expect(options.initialFocus()).toBe(false)
    expect(options.isKeyForward(new KeyboardEvent('keydown', { key: 'Tab' }))).toBe(false)
    expect(
      options.isKeyBackward(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })),
    ).toBe(false)
    for (const [key, index] of [
      ['End', 1],
      ['ArrowDown', 0],
      ['ArrowUp', 1],
      ['Home', 0],
    ] as const) {
      menu.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
      expect(document.activeElement).toBe(items[index])
    }
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    menu.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    expect(trap.deactivate).toHaveBeenCalled()
    expect(document.activeElement).toBe(wrapper.get('button').element)
    await flushPromises()
    await clock.advance(100)
    await wrapper.get('button').trigger('click')
    await clock.advance(100)
    expect(trap.create.mock.lastCall![1].initialFocus()).toBe(document.querySelector('[role=menu]'))
    const autofocus = document.querySelector<HTMLElement>('[role=menuitem]')!
    autofocus.setAttribute('data-autofocus', '')
    expect(trap.create.mock.lastCall![1].initialFocus()).toBe(autofocus)
    wrapper.unmount()
    await clock.advance(100)
  })
  it('safely cancels a dropdown before its pending menu mount completes', async () => {
    let open!: () => Promise<void>
    let close!: () => void
    const wrapper = mountLibrary(BaseDropdown, {
      slots: {
        trigger: (context) => {
          open = context.open
          close = context.close
          return h('button', context.triggerAttrs, 'Options')
        },
        default: () => h(MenuButton, {}, () => 'Action'),
      },
    })
    const opening = open()
    close()
    await opening
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('[role=menu]')).toBeNull()
    wrapper.unmount()
  })
  it('delays tooltip opening, binds its accessible description and closes on Escape', async () => {
    const clock = useTestClock()
    const wrapper = mountLibrary(BaseTooltip, {
      props: { openDelay: 100 },
      slots: {
        trigger: ({ triggerAttrs }) => h('button', triggerAttrs, 'Hover'),
        default: 'Helpful text',
      },
      attachTo: document.body,
    })
    await wrapper.get('button').trigger('pointerenter')
    await clock.advance(99)
    expect(document.querySelector('[role=tooltip]')).toBeNull()
    await clock.advance(1)
    await flushPromises()
    expect(document.querySelector('[role=tooltip]')?.textContent).toContain('Helpful text')
    expect(wrapper.get('button').attributes('aria-describedby')).toBe(
      document.querySelector('[role=tooltip]')?.id,
    )
    await wrapper.get('button').trigger('keydown', { key: 'Escape' })
    expect(document.querySelector('[role=tooltip]')).toBeNull()
    wrapper.unmount()
  })
  it('cancels repeated/pending tooltip work on unmount and honors disabled changes', async () => {
    const clock = useTestClock()
    const wrapper = mountLibrary(BaseTooltip, {
      props: { openDelay: 100 },
      slots: { trigger: ({ triggerAttrs }) => h('button', triggerAttrs, 'Hover'), default: 'Text' },
    })
    await wrapper.get('button').trigger('pointerenter')
    await wrapper.get('button').trigger('pointerenter')
    await wrapper.setProps({ disabled: true })
    await clock.advance(100)
    expect(document.querySelector('[role=tooltip]')).toBeNull()
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('renders menu semantics and closes on selection unless explicitly retained', async () => {
    const clock = useTestClock()
    const clicked = vi.fn()
    const wrapper = mountLibrary(BaseDropdown, {
      slots: {
        trigger: ({ toggle, triggerAttrs }) =>
          h('button', { ...triggerAttrs, onClick: toggle }, 'Options'),
        default: () => h(MenuButton, { onClick: clicked }, () => 'Action'),
      },
      attachTo: document.body,
    })
    await wrapper.get('button').trigger('click')
    await clock.advance(100)
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    document.querySelector<HTMLElement>('[role=menuitem]')!.click()
    await clock.advance(100)
    await flushPromises()
    expect(clicked).toHaveBeenCalledOnce()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ closeOnSelect: false })
    await wrapper.get('button').trigger('click')
    document.querySelector<HTMLElement>('[role=menuitem]')!.click()
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
    expect(document.querySelector('[role=menu]')).toBeNull()
  })
  it('does not open disabled dropdowns or dismiss them for disabled menu items', async () => {
    const wrapper = mountLibrary(BaseDropdown, {
      props: { disabled: true },
      slots: {
        trigger: ({ toggle, triggerAttrs }) =>
          h('button', { ...triggerAttrs, onClick: toggle }, 'Options'),
        default: () => h(MenuButton, { disabled: true }, () => 'Unavailable'),
      },
    })
    await wrapper.get('button').trigger('click')
    expect(document.querySelector('[role=menu]')).toBeNull()
    await wrapper.setProps({ disabled: false })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(document.querySelector('[role=menuitem]')?.getAttribute('disabled')).not.toBeNull()
    await wrapper.setProps({ disabled: true })
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  })
  it('announces toast content, emits manual/automatic closure and clears timers on unmount', async () => {
    const clock = useTestClock()
    const closed = vi.fn()
    const wrapper = mountLibrary(BaseToast, {
      props: {
        toast: {
          id: 'one',
          message: 'Failed request',
          tone: 'danger',
          duration: 100,
          closable: true,
        },
      },
      attrs: { onClose: closed },
    })
    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.get('button').attributes('aria-label')).toBe('Close')
    expect(wrapper.text()).toContain('Failed request')
    await wrapper.get('button').trigger('click')
    expect(closed).toHaveBeenCalledOnce()
    wrapper.unmount()
    await clock.advance(100)
    expect(closed).toHaveBeenCalledOnce()
    const persistent = mountLibrary(BaseToast, {
      props: {
        toast: { id: 'two', message: 'Persistent', tone: 'info', duration: 0, closable: false },
      },
    })
    expect(persistent.find('button').exists()).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
