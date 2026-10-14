import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DataTable from '@/library/components/table/DataTable.vue'
import { mockAnimationFrames } from '@test/support/browser'
import { mountLibrary } from '@test/support/mount'
import { h } from 'vue'

afterEach(() => vi.unstubAllGlobals())

describe('DataTable scroll shadows', () => {
  it('fades each edge with the remaining distance and clears shadows when the table fits', async () => {
    let resize = () => {}
    const disconnect = vi.fn()
    const frames = mockAnimationFrames()
    const scheduleFrame = frames.request
    const cancelFrame = frames.cancel
    const flushFrame = frames.flush
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback
        }
        observe = vi.fn()
        disconnect = disconnect
      },
    )
    const wrapper = mount(DataTable, {
      props: { headers: { name: { label: 'Name' } }, rows: [{ id: 'one' }] },
      global: { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en: {} } })] },
    })
    const scroller = wrapper.get('.data-table__scroll')
    const element = scroller.element as HTMLDivElement
    let width = 600
    let height = 300
    Object.defineProperty(wrapper.get('table').element, 'offsetHeight', { get: () => height })
    const measureWidth = vi.fn(() => width)
    Object.defineProperties(element, {
      clientWidth: { get: () => 200 },
      scrollWidth: { get: measureWidth },
    })
    const opacity = (edge: string) =>
      (wrapper.get('.data-table__viewport').element as HTMLElement).style.getPropertyValue(
        `--scroll-shadow-${edge}`,
      )

    resize()
    flushFrame()
    expect(opacity('left')).toBe('0')
    expect(opacity('right')).toBe('1')
    expect(opacity('height')).toBe('300px')
    element.scrollLeft = 80
    await scroller.trigger('scroll')
    flushFrame()
    expect(opacity('left')).toBe('0.5')
    expect(opacity('right')).toBe('1')
    element.scrollLeft = 320
    await scroller.trigger('scroll')
    flushFrame()
    expect(opacity('left')).toBe('1')
    expect(opacity('right')).toBe('0.5')
    element.scrollLeft = 400
    await scroller.trigger('scroll')
    flushFrame()
    expect(opacity('right')).toBe('0')
    width = 200
    height = 240
    resize()
    flushFrame()
    expect(opacity('left')).toBe('0')
    expect(opacity('right')).toBe('0')
    expect(opacity('height')).toBe('240px')
    const measurements = measureWidth.mock.calls.length
    scheduleFrame.mockClear()
    const setProperty = vi.spyOn(
      (wrapper.get('.data-table__viewport').element as HTMLElement).style,
      'setProperty',
    )
    await scroller.trigger('scroll')
    await scroller.trigger('scroll')
    await scroller.trigger('scroll')
    expect(scheduleFrame).toHaveBeenCalledOnce()
    flushFrame()
    expect(measureWidth).toHaveBeenCalledTimes(measurements)
    expect(setProperty).not.toHaveBeenCalled()
    await scroller.trigger('scroll')
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(cancelFrame).toHaveBeenCalledOnce()
    expect(frames.pending()).toBe(0)
  })
})

describe('DataTable user interaction and empty states', () => {
  function table(
    selectable = false,
    rows = [
      { id: 'one', name: 'First' },
      { id: 'two', name: 'Second' },
    ],
  ) {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    return mountLibrary(DataTable, {
      props: { headers: { name: { label: 'Name', sort: 'name' }, actions: {} }, rows, selectable },
      slots: {
        name: (context: unknown) => (context as { row: { name: string } }).row.name,
        selected: (context: unknown) =>
          h(
            'span',
            { 'data-selected-count': '' },
            String((context as { selected: object[] }).selected.length),
          ),
      },
    })
  }
  it('selects individual/all rows and removes selection for replaced rows without mutating inputs', async () => {
    const rows = [
      { id: 'one', name: 'First' },
      { id: 'two', name: 'Second' },
    ]
    const wrapper = table(true, rows)
    await wrapper.findAll('tbody input')[0]!.setValue(true)
    expect(wrapper.get('[data-selected-count]').text()).toBe('1')
    await wrapper.get('thead input').setValue(true)
    expect(wrapper.get('[data-selected-count]').text()).toBe('2')
    await wrapper.setProps({ rows: [{ id: 'new', name: 'New' }] })
    expect(wrapper.get('[data-selected-count]').text()).toBe('0')
    expect(rows).toEqual([
      { id: 'one', name: 'First' },
      { id: 'two', name: 'Second' },
    ])
  })
  it('emits sorting intent and exposes the controlled sort direction', async () => {
    const wrapper = table()
    await wrapper.get('thead button').trigger('click')
    expect(wrapper.emitted('sort')).toEqual([['name']])
    await wrapper.setProps({ activeSort: 'name', sortOrder: 'ASC' })
    expect(wrapper.get('th').attributes('aria-sort')).toBe('ascending')
    await wrapper.setProps({ sortOrder: 'DESC' })
    expect(wrapper.get('th').attributes('aria-sort')).toBe('descending')
  })
  it('distinguishes loading from an empty result and disables selection while loading', async () => {
    const wrapper = table(true, [])
    expect(wrapper.get('td').attributes('colspan')).toBe('3')
    expect(wrapper.text()).toContain('No results found.')
    await wrapper.setProps({ loading: true })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Loading')
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ loading: false })
    expect(wrapper.attributes('aria-busy')).toBe('false')
  })
})
