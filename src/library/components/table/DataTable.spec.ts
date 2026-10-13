import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import DataTable from './DataTable.vue'

afterEach(() => vi.unstubAllGlobals())

describe('DataTable scroll shadows', () => {
  it('fades each edge with the remaining distance and clears shadows when the table fits', async () => {
    let resize = () => {}
    const disconnect = vi.fn()
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
    Object.defineProperties(element, {
      clientWidth: { get: () => 200 },
      scrollWidth: { get: () => width },
    })
    const opacity = (edge: string) =>
      (wrapper.get('.data-table__viewport').element as HTMLElement).style.getPropertyValue(
        `--scroll-shadow-${edge}`,
      )

    resize()
    await nextTick()
    expect(opacity('left')).toBe('0')
    expect(opacity('right')).toBe('1')
    element.scrollLeft = 80
    await scroller.trigger('scroll')
    expect(opacity('left')).toBe('0.5')
    expect(opacity('right')).toBe('1')
    element.scrollLeft = 320
    await scroller.trigger('scroll')
    expect(opacity('left')).toBe('1')
    expect(opacity('right')).toBe('0.5')
    element.scrollLeft = 400
    await scroller.trigger('scroll')
    expect(opacity('right')).toBe('0')
    width = 200
    resize()
    await nextTick()
    expect(opacity('left')).toBe('0')
    expect(opacity('right')).toBe('0')
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })
})
