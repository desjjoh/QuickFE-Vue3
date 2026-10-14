import { describe, expect, it, vi } from 'vitest'
import { defineComponent, Fragment, h, markRaw, nextTick, ref } from 'vue'
import { mountLibrary, createTestRouter } from '@test/support/mount'
import { setTestViewport } from '@test/support/browser'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import IconButton from '@/library/components/buttons/IconButton.vue'
import ButtonLink from '@/library/components/links/ButtonLink.vue'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'
import StatusIndicator from '@/library/components/badges/StatusIndicator.vue'
import AvatarItem from '@/library/components/avatars/AvatarItem.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import DataList from '@/library/components/datalist/DataList.vue'
import DataListItem from '@/library/components/datalist/DataListItem.vue'
import CompactDataList from '@/library/components/datalist/CompactDataList.vue'
import ActivityTimeline from '@/library/components/timeline/ActivityTimeline.vue'
import ProgressBar from '@/library/components/progress/ProgressBar.vue'
import CircularLoader from '@/library/components/progress/CircularLoader.vue'
import LoaderBar from '@/library/components/progress/LoaderBar.vue'
import BaseCard from '@/library/components/card/BaseCard.vue'
import CardBody from '@/library/components/card/CardBody.vue'
import CardListBody from '@/library/components/card/CardListBody.vue'
import CardListSection from '@/library/components/card/CardListSection.vue'
import CardListItem from '@/library/components/card/CardListItem.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormSection from '@/shared/layouts/FormSection.vue'
import TabLayout from '@/library/components/tabs/TabLayout.vue'
import TabButton from '@/library/components/tabs/TabButton.vue'
import TabHeader from '@/library/components/tabs/TabHeader.vue'
import ErrorBoundary from '@/library/components/error/ErrorBoundary.vue'

const Icon = markRaw(defineComponent({ render: () => h('svg') }))
describe('shared presentation and action contracts', () => {
  it('forwards button clicks and prevents disabled/loading interaction while retaining its accessible name', async () => {
    const warn = vi.spyOn(console, 'warn')
    const action = vi.fn()
    const wrapper = mountLibrary(BaseButton, {
      props: { type: 'submit', icon: Icon, iconPosition: 'start' },
      slots: { default: 'Save' },
      attrs: { onClick: action },
    })
    await wrapper.trigger('click')
    expect(action).toHaveBeenCalledOnce()
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.text()).toBe('Save')
    await wrapper.setProps({ loading: true })
    await wrapper.trigger('click')
    expect(action).toHaveBeenCalledOnce()
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.get('.button__loading').attributes('aria-hidden')).toBe('true')
    const icon = mountLibrary(IconButton, { props: { icon: Icon, label: 'Inspect' } })
    expect(icon.attributes('aria-label')).toBe('Inspect')
    expect(warn).not.toHaveBeenCalled()
  })
  it('uses route navigation for internal links and safe external anchor attributes', async () => {
    const router = await createTestRouter([
      { path: '/', component: { render: () => null } },
      { path: '/next', component: { render: () => null } },
    ])
    const internal = mountLibrary(ButtonLink, {
      props: { to: '/next' },
      slots: { default: 'Next' },
      global: { plugins: [router] },
    })
    await internal.trigger('click')
    await nextTick()
    await router.isReady()
    expect(internal.attributes('href')).toBe('/next')
    const external = mountLibrary(ButtonLink, {
      props: { href: 'https://example.test', external: true },
      slots: { default: 'External' },
    })
    expect(external.attributes('target')).toBe('_blank')
    expect(external.attributes('rel')).toBe('noopener noreferrer')
    expect(external.attributes('href')).toBe('https://example.test')
  })
  it('retains badge/status text while hiding decorative icons from assistive technology', () => {
    const badge = mountLibrary(BaseBadge, {
      props: { icon: Icon, tone: 'danger', pill: true },
      slots: { default: 'Deleted' },
    })
    expect(badge.text()).toBe('Deleted')
    expect(badge.get('svg').attributes('aria-hidden')).toBe('true')
    const status = mountLibrary(StatusIndicator, { slots: { default: 'Active' } })
    expect(status.text()).toBe('Active')
    expect(status.get('.status-indicator__marker').attributes('aria-hidden')).toBe('true')
  })
  it('shows an avatar fallback on image failure and retries when the source changes', async () => {
    const avatar = mountLibrary(AvatarItem, {
      props: { src: 'first.png', alt: 'Profile', fallback: 'JD' },
    })
    expect(avatar.attributes('aria-label')).toBe('Profile')
    await avatar.get('img').trigger('error')
    expect(avatar.find('img').exists()).toBe(false)
    expect(avatar.text()).toBe('JD')
    await avatar.setProps({ src: 'second.png' })
    expect(avatar.get('img').attributes('src')).toBe('second.png')
    await avatar.setProps({ src: undefined, fallback: undefined })
    expect(avatar.find('svg').exists()).toBe(true)
  })
  it('renders requested text semantics without interpreting content as HTML', () => {
    const block = mountLibrary(BlockText, {
      props: { element: 'h2', truncate: true },
      slots: { default: () => '<script>plain text</script>' },
    })
    expect(block.element.tagName).toBe('H2')
    expect(block.find('script').exists()).toBe(false)
    const inline = mountLibrary(InlineText, {
      props: { element: 'strong' },
      slots: { default: 'Emphasis' },
    })
    expect(inline.element.tagName).toBe('STRONG')
  })
  it.each([BaseCard, CardBody, CardListBody, CardListSection, CompactDataList])(
    'preserves composed content and interactive child events',
    async (component) => {
      const clicked = vi.fn()
      const wrapper = mountLibrary(BaseCard, {
        slots: {
          default: () =>
            h(component, {}, { default: () => h('button', { onClick: clicked }, 'Child') }),
        },
      })
      await wrapper.get('button').trigger('click')
      expect(clicked).toHaveBeenCalledOnce()
    },
  )
  it('renders optional card-list regions only when supplied and responds to viewport changes', async () => {
    setTestViewport(1600)
    const wrapper = mountLibrary(CardListItem, {
      slots: { default: 'Label', start: 'Icon', value: 'Value', end: 'Action' },
    })
    expect(wrapper.get('.card-list-item__value').text()).toBe('Value')
    await wrapper.setProps({ hideStart: true })
    expect(wrapper.find('.card-list-item__start').exists()).toBe(false)
    setTestViewport(390)
    await nextTick()
    expect(wrapper.classes()).toContain('is-mobile')
  })
  it('shows datalist empty values without losing valid falsy values or labels', () => {
    const wrapper = mountLibrary(DataList, {
      slots: {
        default: () => [
          h(DataListItem, { label: 'Missing', value: null, emptyLabel: 'Unavailable' }),
          h(DataListItem, { label: 'Count', value: 0 }),
        ],
      },
    })
    expect(wrapper.element.tagName).toBe('DL')
    expect(wrapper.findAll('dt').map((node) => node.text())).toEqual(['Missing', 'Count'])
    expect(wrapper.findAll('dd').map((node) => node.text())).toEqual(['Unavailable', '0'])
  })
  it('limits timeline items without changing input and keeps placeholders free of content', async () => {
    const items = [
      { id: 'one', title: 'First', description: 'Details' },
      { id: 'two', title: 'Second' },
    ]
    const wrapper = mountLibrary(ActivityTimeline, { props: { items, itemLimit: 3 } })
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.get('.is-placeholder').text()).toBe('')
    expect(items).toHaveLength(2)
    await wrapper.setProps({ itemLimit: 1 })
    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).not.toContain('Second')
    await wrapper.setProps({ items: [] })
    expect(wrapper.findAll('.is-placeholder')).toHaveLength(1)
  })
  it.each([
    [-1, 100, '0'],
    [200, 100, '100'],
    [25, 50, '25'],
    [1, 0, '1'],
    [NaN, 100, '0'],
    [10, Infinity, '10'],
  ])('keeps progress accessible for value %i max %i', (value, max, expected) => {
    const wrapper = mountLibrary(ProgressBar, { props: { value, max } })
    expect(wrapper.attributes('aria-valuenow')).toBe(expected)
    expect(wrapper.attributes('aria-valuetext')).not.toContain('NaN')
  })
  it('labels indeterminate loaders without inventing determinate values', () => {
    const circle = mountLibrary(CircularLoader, { props: { label: 'Fetching', size: '2rem' } })
    expect(circle.attributes('aria-valuetext')).toBe('Fetching')
    expect(circle.attributes('aria-valuenow')).toBeUndefined()
    const bar = mountLibrary(LoaderBar)
    expect(bar.attributes('role')).toBe('progressbar')
  })
})

describe('forms, tab composition and errors', () => {
  it('navigates tabs with wrapping arrows, Home and End while skipping disabled tabs', async () => {
    const wrapper = mountLibrary(TabLayout, {
      attachTo: document.body,
      slots: {
        tabs: () => [
          h(TabButton, { id: 'one' }, () => 'One'),
          h('button', { role: 'tab', disabled: true }, 'Disabled'),
          h(TabButton, { id: 'two' }, () => 'Two'),
        ],
        one: 'First body',
        two: 'Second body',
      },
    })
    const tabs = wrapper.findAll('[role=tab]')
    for (const [key, index] of [
      ['ArrowRight', 2],
      ['ArrowRight', 0],
      ['ArrowLeft', 2],
      ['Home', 0],
      ['End', 2],
    ] as const) {
      await wrapper.get('[aria-selected=true]').trigger('keydown', { key })
      expect(document.activeElement).toBe(tabs[index]!.element)
      expect(tabs[index]!.attributes('aria-selected')).toBe('true')
      expect(tabs[index]!.attributes('tabindex')).toBe('0')
      expect(wrapper.get('[role=tabpanel]').attributes('aria-labelledby')).toBe(
        tabs[index]!.attributes('id'),
      )
    }
    await tabs[2]!.trigger('keydown', { key: 'Tab' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(5)
    await wrapper.get('[role=tablist]').trigger('keydown', { key: 'Home' })
    const nested = mountLibrary(TabHeader, {
      slots: {
        default: () => h('div', { role: 'tablist' }, [h('button', { role: 'tab' }, 'Nested')]),
      },
    })
    const clicked = vi.spyOn(nested.get('button').element as HTMLButtonElement, 'click')
    await nested.get('button').trigger('keydown', { key: 'ArrowRight' })
    expect(clicked).not.toHaveBeenCalled()
    wrapper.unmount()
    nested.unmount()
  })
  it('renders form errors/content/actions and supports optional block actions', async () => {
    const wrapper = mountLibrary(FormLayout, {
      props: { title: 'Form' },
      slots: {
        content: () =>
          h(
            FormField,
            {},
            { header: () => 'Label', default: () => 'Value', error: () => 'Invalid' },
          ),
        errors: 'Request failed',
        actions: () => h('button', 'Apply'),
      },
    })
    expect(wrapper.text()).toContain('Request failed')
    expect(wrapper.text()).toContain('Invalid')
    expect(wrapper.get('.form__layout-actions').classes()).not.toContain('is-block')
    await wrapper.setProps({ blockActions: true })
    expect(wrapper.get('.form__layout-actions').classes()).toContain('is-block')
    const section = mountLibrary(FormSection, { slots: { default: 'Body' } })
    expect(section.find('.form__section-header').exists()).toBe(false)
    expect(section.text()).toBe('Body')
  })
  it('switches uncontrolled tabs and honors controlled changes without exposing unknown content', async () => {
    const warn = vi.spyOn(console, 'warn')
    const wrapper = mountLibrary(TabLayout, {
      slots: {
        tabs: () => [
          h(TabButton, { id: 'one' }, () => 'One'),
          h(TabButton, { id: 'two' }, () => 'Two'),
        ],
        one: 'First body',
        two: 'Second body',
      },
    })
    await nextTick()
    expect(wrapper.text()).toContain('First body')
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['two']])
    expect(wrapper.text()).toContain('Second body')
    await wrapper.setProps({ modelValue: 'missing' })
    expect(wrapper.find('.tabs__body').exists()).toBe(false)
    expect(warn).not.toHaveBeenCalled()
  })
  it('reacts to initially empty tab slots and selects the first tab inside a fragment without warnings', async () => {
    const warn = vi.spyOn(console, 'warn')
    const ready = ref(false)
    const wrapper = mountLibrary(TabLayout, {
      slots: {
        tabs: () => (ready.value ? h(Fragment, [h(TabButton, { id: 'one' }, () => 'One')]) : []),
        one: 'First body',
      },
    })
    expect(wrapper.find('.tabs__body').exists()).toBe(false)
    ready.value = true
    await nextTick()
    expect(wrapper.text()).toContain('First body')
    expect(wrapper.get('button').classes()).toContain('active')
    expect(warn).not.toHaveBeenCalled()
  })
  it('renders a recoverable error slot and retries after clearing the failure', async () => {
    const fail = ref(true)
    const child = defineComponent({
      render() {
        if (fail.value) throw new Error('render failed')
        return h('span', 'Recovered')
      },
    })
    const wrapper = mountLibrary(ErrorBoundary, {
      slots: {
        default: () => h(child),
        error: ({ error, clearError }) =>
          h(
            'button',
            {
              onClick: () => {
                fail.value = false
                clearError?.()
              },
            },
            error.message,
          ),
      },
    })
    await nextTick()
    expect(wrapper.text()).toBe('render failed')
    await wrapper.get('button').trigger('click')
    await nextTick()
    expect(wrapper.text()).toBe('Recovered')
  })
})
