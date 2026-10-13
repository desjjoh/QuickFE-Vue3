import { describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mountLibrary } from '@test/support/mount'
import { useTestClock } from '@test/support/async'
import BaseTooltip from './tooltips/BaseTooltip.vue'
import BaseDropdown from './dropdowns/BaseDropdown.vue'
import MenuButton from './dropdowns/MenuButton.vue'
import BaseToast from './toasts/BaseToast.vue'

vi.mock('focus-trap', () => ({
  createFocusTrap: () => ({ activate: vi.fn(), deactivate: vi.fn() }),
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
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    document.querySelector<HTMLElement>('[role=menuitem]')!.click()
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
