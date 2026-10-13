import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useForm } from 'vee-validate'
import { flushPromises } from '@vue/test-utils'
import { mountLibrary } from '@test/support/mount'
import { useTestClock } from '@test/support/async'
import TextField from './TextField.vue'
import TextArea from './TextArea.vue'
import PasswordInput from './PasswordInput.vue'
import DateInput from './DateInput.vue'
import CheckBox from './CheckBox.vue'
import FileInput from './FileInput.vue'
import SearchField from './SearchField.vue'
import SelectInput from './SelectInput.vue'

vi.mock('focus-trap', () => ({
  createFocusTrap: () => ({ activate: vi.fn(), deactivate: vi.fn() }),
}))
vi.mock('@floating-ui/vue', () => ({
  useFloating: () => ({ floatingStyles: ref({}) }),
  autoUpdate: vi.fn(),
  offset: vi.fn(),
  flip: vi.fn(),
  size: vi.fn(),
}))
const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
beforeEach(() =>
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  }),
)
afterEach(() => {
  if (scrollDescriptor)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollDescriptor)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

describe('text and controlled input contracts', () => {
  it.each([TextField, TextArea])(
    'synchronizes external values without echoing, emits edits and exposes readonly/disabled state',
    async (component) => {
      const wrapper = mountLibrary(component, {
        props: { name: 'field', value: 'initial', placeholder: 'Label' },
      })
      const input = wrapper.find('input, textarea')
      expect((input.element as HTMLInputElement).value).toBe('initial')
      await wrapper.setProps({ value: 'external' })
      expect(wrapper.emitted('update')).toBeUndefined()
      await input.setValue('typed')
      expect(wrapper.emitted('update')).toEqual([['typed']])
      await wrapper.setProps({ disabled: true, readonly: true })
      expect(input.attributes('disabled')).toBeDefined()
      expect(input.attributes('readonly')).toBeDefined()
    },
  )
  it('shows real validation failures and clears them after correction', async () => {
    let validate!: () => Promise<unknown>
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          const form = useForm({
            validationSchema: { required: (value: unknown) => !!value || 'Required' },
          })
          validate = form.validate
          return () => h(TextField, { name: 'required' })
        },
      }),
    )
    await validate()
    await flushPromises()
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    await wrapper.get('input').setValue('valid')
    await validate()
    await flushPromises()
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('false')
  })
  it.each([PasswordInput, DateInput])(
    'updates a controlled value after initialization without emitting an edit',
    async (component) => {
      const wrapper = mountLibrary(component, { props: { name: 'field', value: 'initial' } })
      await wrapper.setProps({ value: 'changed' })
      expect((wrapper.get('input').element as HTMLInputElement).value).toBe('changed')
      expect(wrapper.emitted('update')).toBeUndefined()
    },
  )
  it('toggles password visibility with an accessible state and restores input focus', async () => {
    const wrapper = mountLibrary(PasswordInput, {
      props: { name: 'password', value: 'secret' },
      attachTo: document.body,
    })
    expect(wrapper.get('input').attributes('type')).toBe('password')
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('text')
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('input').element)
    await wrapper.setProps({ disabled: true })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
  it.each([
    ['20260101', '2026-01-01'],
    ['abc2026/01/01extra', '2026-01-01'],
    ['20261', '2026-1'],
    ['', undefined],
  ])('normalizes date input %s', async (raw, expected) => {
    const wrapper = mountLibrary(DateInput, { props: { name: 'date' } })
    await wrapper.get('input').setValue(raw)
    expect(wrapper.emitted('update')).toEqual([[expected]])
    expect(wrapper.get('input').attributes('maxlength')).toBe('10')
  })
  it('synchronizes checkboxes and prevents readonly changes', async () => {
    const wrapper = mountLibrary(CheckBox, {
      props: { name: 'check', id: 'check-id', value: false },
    })
    expect(wrapper.get('label').attributes('for')).toBe('check-id')
    await wrapper.get('input').setValue(true)
    expect(wrapper.emitted('update')).toEqual([[true]])
    await wrapper.setProps({ value: true })
    await wrapper.setProps({ value: false, readonly: true })
    await wrapper.get('input').setValue(true)
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.emitted('update')).toHaveLength(1)
  })
})

describe('search, file and select interactions', () => {
  it('surfaces rejected file validation and recovers when a valid file replaces it', async () => {
    let validate!: () => Promise<unknown>
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          const form = useForm({
            validationSchema: {
              upload: (file: File | null) => file?.type === 'image/png' || 'PNG required',
            },
          })
          validate = form.validate
          return () => h(FileInput, { name: 'upload' })
        },
      }),
    )
    const input = wrapper.get('input[type=file]')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['text'], 'file.txt', { type: 'text/plain' })],
    })
    await input.trigger('change')
    await validate()
    await flushPromises()
    expect(wrapper.get('.file-input').classes()).toContain('has-error')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['image'], 'image.png', { type: 'image/png' })],
    })
    await input.trigger('change')
    await validate()
    await flushPromises()
    expect(wrapper.get('.file-input').classes()).not.toContain('has-error')
  })
  it('debounces search, clears exactly once, and cancels pending searches on unmount', async () => {
    const clock = useTestClock()
    const searched = vi.fn()
    const wrapper = mountLibrary(SearchField, {
      props: { name: 'search', debounceMs: 100 },
      attrs: { onSearch: searched },
    })
    await wrapper.get('input').setValue('old')
    await clock.advance(50)
    await wrapper.get('input').setValue('new')
    await clock.advance(100)
    expect(wrapper.emitted('search')).toEqual([['new']])
    const updates = wrapper.emitted('update')!.length
    await wrapper.get('button').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update')).toHaveLength(updates + 1)
    expect(wrapper.emitted('clear')).toEqual([[]])
    await wrapper.get('input').setValue('pending')
    wrapper.unmount()
    await clock.advance(100)
    expect(searched).toHaveBeenCalledTimes(2)
  })
  it('does not offer search clearing when readonly or disabled', () => {
    for (const props of [{ readonly: true }, { disabled: true }, { clearable: false }]) {
      const wrapper = mountLibrary(SearchField, {
        props: { name: 'search', value: 'value', ...props },
      })
      expect(wrapper.find('button').exists()).toBe(false)
      wrapper.unmount()
    }
  })
  it('emits actual selected files, handles cancellation and blocks a disabled picker', async () => {
    const wrapper = mountLibrary(FileInput, { props: { name: 'upload', accept: 'image/*' } })
    const native = wrapper.get('input[type=file]')
    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(native.element, 'files', { configurable: true, value: [file] })
    await native.trigger('change')
    expect(wrapper.emitted('update')).toEqual([[file]])
    expect((wrapper.get('input[type=text]').element as HTMLInputElement).value).toBe('avatar.png')
    Object.defineProperty(native.element, 'files', { configurable: true, value: [] })
    await native.trigger('change')
    expect(wrapper.emitted('update')).toEqual([[file], [null]])
    const click = vi.spyOn(native.element as HTMLInputElement, 'click')
    await wrapper.setProps({ disabled: true })
    await wrapper.get('input[type=text]').trigger('keydown', { key: 'Enter' })
    expect(click).not.toHaveBeenCalled()
  })
  it('cancels queued file-picker focus restoration on unmount', async () => {
    const clock = useTestClock()
    const wrapper = mountLibrary(FileInput, { props: { name: 'upload' } })
    await wrapper.get('input[type=text]').trigger('keydown', { key: 'Enter' })
    window.dispatchEvent(new Event('focus'))
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
    await clock.advance(0)
  })
  it('selects by keyboard, exposes option semantics and synchronizes external values', async () => {
    const wrapper = mountLibrary(SelectInput<string>, {
      props: { id: 'select', name: 'select', options: ['one', 'two'], value: 'one' },
      attachTo: document.body,
    })
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.get('input').attributes('role')).toBe('combobox')
    await flushPromises()
    const menu = document.querySelector<HTMLElement>('[role=listbox]')!
    expect(wrapper.get('input').attributes('aria-expanded')).toBe('true')
    expect(menu.querySelector('[aria-selected=true]')?.textContent).toContain('one')
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update')).toEqual([['two']])
    expect(document.activeElement).toBe(wrapper.get('input').element)
    await wrapper.setProps({ value: 'two' })
    await wrapper.setProps({ value: 'one' })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('one')
    expect(wrapper.emitted('update')).toHaveLength(1)
    wrapper.unmount()
    expect(document.querySelector('[role=listbox]')).toBeNull()
  })
})
