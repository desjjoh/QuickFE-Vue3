import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { flushPromises } from '@vue/test-utils'
import { mountHook, mountLibrary, createTestRouter } from '@test/support/mount'
import { deferred } from '@test/support/async'
import { mockAnimationFrames, setTestViewport } from '@test/support/browser'
import { useDismissableLayer } from './useDismissableLayer'
import { afterLayoutReady } from './useLayoutReadiness'
import { usePaginatedQuery, normalizePaginatedQuery, getNextSortQuery } from './usePaginatedQuery'
import { useDynamicPageTitle } from './useDynamicTitle'
import { useViewport } from './useViewport'
import { useTextField } from './useTextField'
import { useFormUtil } from './useForm'
import * as yup from 'yup'

describe('dismissable layer lifecycle', () => {
  it('listens when initially open, ignores internal interactions, and removes listeners on close/unmount', async () => {
    const open = ref(true)
    const trigger = document.createElement('button')
    const content = document.createElement('div')
    const child = document.createElement('input')
    content.append(child)
    document.body.append(trigger, content)
    const dismiss = vi.fn()
    const outsideKey = vi.fn()
    const { wrapper } = mountHook(() =>
      useDismissableLayer({
        isOpen: open,
        triggerRef: ref(trigger),
        contentRef: ref(content),
        onDismiss: dismiss,
        onOutsideKeydown: outsideKey,
      }),
    )
    try {
      trigger.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      child.dispatchEvent(new Event('focusin', { bubbles: true }))
      child.dispatchEvent(new Event('wheel', { bubbles: true }))
      expect(dismiss).not.toHaveBeenCalled()
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      expect(dismiss).toHaveBeenCalledOnce()
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(outsideKey).toHaveBeenCalledOnce()
      open.value = false
      await nextTick()
      document.body.dispatchEvent(new Event('wheel', { bubbles: true }))
      expect(dismiss).toHaveBeenCalledOnce()
      open.value = true
      await nextTick()
      document.body.dispatchEvent(new Event('touchmove', { bubbles: true }))
      expect(dismiss).toHaveBeenCalledTimes(2)
      wrapper.unmount()
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      expect(dismiss).toHaveBeenCalledTimes(2)
    } finally {
      wrapper.unmount()
      trigger.remove()
      content.remove()
    }
  })
})

describe('layout readiness and cancellation', () => {
  it('uses fallback font layout after font loading fails and removes cancelled load listeners', async () => {
    const frames = mockAnimationFrames()
    const fonts = deferred<void>()
    const callback = vi.fn()
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { status: 'loading', ready: fonts.promise },
    })
    try {
      afterLayoutReady(callback)
      fonts.reject(new Error('font failed'))
      await flushPromises()
      frames.flush()
      expect(callback).toHaveBeenCalledOnce()
    } finally {
      Reflect.deleteProperty(document, 'fonts')
    }
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    const remove = vi.spyOn(window, 'removeEventListener')
    const cancel = afterLayoutReady(callback)
    cancel()
    await flushPromises()
    expect(remove).toHaveBeenCalledWith('load', expect.any(Function))
    expect(frames.pending()).toBe(0)
  })
  it('waits for load and fonts, then schedules only one callback', async () => {
    const frames = mockAnimationFrames()
    const fonts = deferred<void>()
    const callback = vi.fn()
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { status: 'loading', ready: fonts.promise },
    })
    try {
      const cancel = afterLayoutReady(callback)
      await flushPromises()
      expect(frames.pending()).toBe(0)
      window.dispatchEvent(new Event('load'))
      await flushPromises()
      expect(frames.pending()).toBe(0)
      fonts.resolve()
      await flushPromises()
      expect(frames.pending()).toBe(1)
      frames.flush()
      expect(callback).toHaveBeenCalledOnce()
      cancel()
    } finally {
      Reflect.deleteProperty(document, 'fonts')
    }
  })
  it('cancels before readiness or before the queued frame', async () => {
    const frames = mockAnimationFrames()
    const callback = vi.fn()
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
    const early = afterLayoutReady(callback)
    early()
    await flushPromises()
    expect(frames.pending()).toBe(0)
    const later = afterLayoutReady(callback)
    await flushPromises()
    expect(frames.pending()).toBe(1)
    later()
    frames.flush()
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('reactive URL pagination and title lifecycle', () => {
  it('reports rejected fetch callbacks through Vue and propagates rejected route updates', async () => {
    const router = await createTestRouter(
      [{ path: '/table', component: { render: () => null } }],
      '/table',
    )
    const failure = new Error('fetch failed')
    const handler = vi.fn()
    let pagination!: ReturnType<typeof usePaginatedQuery>
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          pagination = usePaginatedQuery({ page: 1, take: 10 }, () => Promise.reject(failure))
          return () => null
        },
      }),
      { global: { plugins: [router], config: { errorHandler: handler } } },
    )
    await flushPromises()
    expect(handler).toHaveBeenCalledWith(
      failure,
      expect.anything(),
      expect.stringContaining('watcher'),
    )
    vi.spyOn(router, 'replace').mockRejectedValue(new Error('navigation failed'))
    await expect(pagination.updateQuery({ page: 2 })).rejects.toThrow('navigation failed')
    expect(pagination.query.value.page).toBe(1)
    wrapper.unmount()
  })
  it.each(['0', '-1', '1.5', 'garbage', 'Infinity', ''])(
    'falls back for invalid page/take %s',
    (value) =>
      expect(normalizePaginatedQuery({ page: value, take: value }, { page: 2, take: 25 })).toEqual({
        page: 2,
        take: 25,
      }),
  )
  it('normalizes arrays/blank search and ignores ordering without a valid sort', () => {
    expect(
      normalizePaginatedQuery(
        { page: ['3', '4'], search: '   ', order: 'DESC' },
        { page: 1, take: 10 },
      ),
    ).toEqual({ page: 3, take: 10 })
    expect(getNextSortQuery({ sort: 'event', order: 'ASC' }, 'event')).toEqual({
      sort: 'event',
      order: 'DESC',
    })
    expect(getNextSortQuery({ sort: 'event', order: 'DESC' }, 'event')).toEqual({
      sort: undefined,
      order: undefined,
    })
  })
  it('reacts to URL navigation, preserves configured defaults and stops fetch callbacks after unmount', async () => {
    const router = await createTestRouter(
      [{ path: '/table', component: { template: '<div />' } }],
      '/table?page=3&domain=identity',
    )
    const changed = vi.fn()
    let pagination!: ReturnType<typeof usePaginatedQuery>
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          pagination = usePaginatedQuery({ page: 1, take: 10 }, changed)
          return () => null
        },
      }),
      { global: { plugins: [router] } },
    )
    expect(changed).toHaveBeenCalledWith({ page: 3, take: 10 })
    await pagination.updateQuery({ take: 10, search: 'query' }, true)
    await nextTick()
    expect(router.currentRoute.value.query).toEqual({ domain: 'identity', search: 'query' })
    await pagination.toggleSort('event')
    expect(router.currentRoute.value.query).toMatchObject({ sort: 'event', order: 'ASC' })
    await pagination.resetFilters()
    expect(router.currentRoute.value.query).toEqual({})
    wrapper.unmount()
    changed.mockClear()
    await router.replace('/table?page=5')
    await nextTick()
    expect(changed).not.toHaveBeenCalled()
  })
  it('updates titles for route and locale changes and stops watching after unmount', async () => {
    const oldTitle = document.title
    const router = await createTestRouter(
      [
        {
          path: '/one',
          meta: { pageTitle: 'library.table.pagination.first' },
          component: { template: '<div />' },
        },
        { path: '/two', component: { template: '<div />' } },
      ],
      '/one',
    )
    let locale!: import('vue').Ref<string>
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          locale = useI18n().locale
          useDynamicPageTitle()
          return () => null
        },
      }),
      { global: { plugins: [router] } },
    )
    try {
      expect(document.title).toContain('First page')
      locale.value = 'fr'
      await nextTick()
      expect(document.title).toContain('Première page')
      await router.push('/two')
      await nextTick()
      expect(document.title).not.toContain(' — ')
      wrapper.unmount()
      const last = document.title
      await router.push('/one')
      await nextTick()
      expect(document.title).toBe(last)
    } finally {
      wrapper.unmount()
      document.title = oldTitle
    }
  })
  it.each([
    [767, true, false],
    [768, false, false],
    [1399, false, false],
    [1400, false, true],
  ])('uses viewport boundary %i', (width, mobile, desktop) => {
    setTestViewport(width)
    expect(useViewport().isMobile.value).toBe(mobile)
    expect(useViewport().isDesktop.value).toBe(desktop)
  })
})

describe('field synchronization and form delegation', () => {
  it('syncs external values without echoing and emits user edits only while mounted', async () => {
    const props = reactive({ name: 'test', value: 'initial' })
    const emit = vi.fn()
    const { result, wrapper } = mountHook(() => useTextField(props, emit))
    props.value = 'external'
    await nextTick()
    expect(result.value.value).toBe('external')
    expect(emit).not.toHaveBeenCalled()
    result.handleChange('typed', false)
    await nextTick()
    expect(emit).toHaveBeenCalledWith('update', 'typed')
    wrapper.unmount()
    emit.mockClear()
    props.value = 'late'
    await nextTick()
    expect(emit).not.toHaveBeenCalled()
  })
  it('preserves values and propagates asynchronous form submission errors', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('failed'))
    const submit = useFormUtil().getSubmitFn(
      yup.object({ name: yup.string().required() }),
      callback,
    )
    const values = Object.freeze({ name: 'unchanged' })
    await expect(submit(values)).rejects.toThrow('failed')
    expect(callback).toHaveBeenCalledWith(values)
  })
})
