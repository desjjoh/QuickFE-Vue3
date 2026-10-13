import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DataTable from './DataTable.vue'

afterEach(() => vi.unstubAllGlobals())

describe('DataTable scroll shadows', () => {
  it('fades each edge with the remaining distance and clears shadows when the table fits', async () => {
    let resize = () => {}
    const disconnect = vi.fn()
    let frame: FrameRequestCallback | undefined
    const scheduleFrame = vi.fn((callback: FrameRequestCallback) => {
      frame = callback
      return 1
    })
    const cancelFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', scheduleFrame)
    vi.stubGlobal('cancelAnimationFrame', cancelFrame)
    const flushFrame = () => {
      const callback = frame
      frame = undefined
      callback?.(0)
    }
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
    expect(cancelFrame).toHaveBeenCalledWith(1)
  })
})
