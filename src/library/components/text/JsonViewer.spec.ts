import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import JsonViewer from './JsonViewer.vue'
import { toSafeJson } from '@/shared/helpers/json-viewer'

function viewer(item: unknown, title?: string) {
  return mount(JsonViewer, {
    props: { item, title },
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'en', messages: { en: { sample: 'Details' } } }),
      ],
    },
  })
}

describe('JsonViewer', () => {
  it('limits enormous nested strings and array labels without modifying the original data', async () => {
    const content = 'x'.repeat(10000)
    const item = { content, items: [{ name: content }, content] }
    const wrapper = viewer(item)
    expect(wrapper.findAll('.pd-string').map((node) => node.text())).toEqual(
      Array(3).fill(`${'x'.repeat(500)}…`),
    )
    expect(item.content).toBe(content)
    await wrapper.setProps({ maxStringLength: 10 })
    expect(wrapper.findAll('.pd-string').map((node) => node.text())).toEqual(
      Array(3).fill('xxxxxxxxxx…'),
    )
  })
  it('escapes truncated strings and does not split an emoji at the boundary', async () => {
    const wrapper = viewer({ content: 'abc😀<script>bad</script>' })
    await wrapper.setProps({ maxStringLength: 4 })
    expect(wrapper.get('.pd-string').text()).toBe('abc…')
    await wrapper.setProps({ maxStringLength: 15 })
    expect(wrapper.find('script').exists()).toBe(false)
  })
  it('preserves nested fields and primary labels in arrays', () => {
    const wrapper = viewer(
      { users: [{ id: 'one', active: true }], count: 2, removed: null },
      'sample',
    )
    expect(wrapper.get('h6').text()).toBe('Details')
    expect(wrapper.get('code').text()).toContain('- id: one')
    expect(wrapper.find('.pd-boolean').text()).toBe('true')
    expect(wrapper.find('.pd-number').text()).toBe('2')
    expect(wrapper.find('.pd-null').text()).toBe('null')
  })

  it('escapes untrusted keys and values before HTML rendering and preserves whitespace', () => {
    const wrapper = viewer({ '<img src=x onerror=alert(1)>': '  <script>alert(1)</script> &  ' })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.get('.pd-string').element.textContent).toBe('  <script>alert(1)</script> &  ')
  })

  it('updates when the item and indentation change', async () => {
    const wrapper = viewer({ before: false })
    await wrapper.setProps({ item: { parent: { after: true } }, indentSize: 4 })
    expect(wrapper.get('code').text()).not.toContain('before')
    expect(wrapper.get('code').text()).toContain('after: true')
    expect(wrapper.get('code').element.textContent).toContain('\u00a0'.repeat(4))
    expect(wrapper.find('h6').exists()).toBe(false)
  })

  it('normalizes DTO dates, bigint and circular data without mistaking repeated references for cycles', () => {
    const shared = { id: 'same' }
    const item: Record<string, unknown> = {
      date: new Date('2026-10-12T12:00:00Z'),
      count: BigInt(12),
      first: shared,
      second: shared,
    }
    item.self = item
    expect(toSafeJson(item)).toEqual({
      date: '2026-10-12T12:00:00.000Z',
      count: '12',
      first: shared,
      second: shared,
      self: '[Circular]',
    })
    expect(viewer(item).get('code').text()).toContain('[Circular]')
  })

  it('renders empty objects, arrays, and absent values', () => {
    expect(viewer({}).get('code').text()).toBe('(empty)')
    expect(viewer([]).get('code').text()).toBe('[ ]')
    expect(viewer(undefined).get('code').text()).toBe('null')
  })
})
