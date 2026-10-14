import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DataTablePagination from '@/library/components/table/DataTablePagination.vue'

describe('DataTablePagination', () => {
  it.each([
    [1, 10, [1, 2, 3]],
    [3, 10, [2, 3, 4]],
    [5, 10, [4, 5, 6]],
    [8, 10, [7, 8, 9]],
    [10, 10, [8, 9, 10]],
    [4, 7, [3, 4, 5]],
    [1, 1, [1]],
    [2, 2, [1, 2]],
    [1, 0, [1]],
  ])('shows neighboring pages at page %i of %i', (page, pageCount, expected) => {
    const wrapper = mount(DataTablePagination, {
      props: {
        page,
        pageCount,
        take: 5,
        itemCount: 49,
        hasPreviousPage: page > 1,
        hasNextPage: page < pageCount,
      },
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'en',
            missingWarn: false,
            fallbackWarn: false,
            messages: { en: {} },
          }),
        ],
      },
    })
    const buttons = wrapper
      .findAll('.table-pagination__button')
      .filter((button) => /^\d+$/.test(button.text()))
    expect(buttons.map((button) => Number(button.text()))).toEqual(expected)
    expect(
      buttons.find((button) => Number(button.text()) === page)?.attributes('aria-current'),
    ).toBe('page')
    wrapper.unmount()
  })

  it('allows navigating to page 7 from page 8 of 10', async () => {
    const wrapper = mount(DataTablePagination, {
      props: {
        page: 8,
        pageCount: 10,
        take: 5,
        itemCount: 49,
        hasPreviousPage: true,
        hasNextPage: true,
      },
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'en',
            missingWarn: false,
            fallbackWarn: false,
            messages: { en: {} },
          }),
        ],
      },
    })
    await wrapper
      .findAll('.table-pagination__button')
      .find((button) => button.text() === '7')!
      .trigger('click')
    expect(wrapper.emitted('page')).toEqual([[7]])
    const first = wrapper.findAll('.table-pagination__button')[0]!
    const pageButtons = wrapper.findAll('.table-pagination__button')
    const last = pageButtons[pageButtons.length - 1]!
    const previous = pageButtons[1]!
    const next = pageButtons[pageButtons.length - 2]!
    expect(previous.attributes('aria-label')).toBe('library.table.pagination.previous')
    expect(next.attributes('aria-label')).toBe('library.table.pagination.next')
    await previous.trigger('click')
    await next.trigger('click')
    await first.trigger('click')
    await last.trigger('click')
    expect(wrapper.emitted('page')).toEqual([[7], [7], [9], [1], [10]])
    await wrapper.setProps({ page: 1 })
    expect(first.attributes('disabled')).toBeDefined()
    expect(previous.attributes('disabled')).toBeDefined()
    await previous.trigger('click')
    expect(wrapper.emitted('page')).toHaveLength(5)
    expect(next.attributes('disabled')).toBeUndefined()
    expect(last.attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ page: 10 })
    expect(first.attributes('disabled')).toBeUndefined()
    expect(last.attributes('disabled')).toBeDefined()
    expect(next.attributes('disabled')).toBeDefined()
    await next.trigger('click')
    expect(wrapper.emitted('page')).toHaveLength(5)
    expect(previous.attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ page: 1, pageCount: 0 })
    expect(previous.attributes('disabled')).toBeDefined()
    expect(next.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})
