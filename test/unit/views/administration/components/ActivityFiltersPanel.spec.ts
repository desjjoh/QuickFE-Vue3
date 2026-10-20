import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mountLibrary } from '@test/support/mount'
import { deferred } from '@test/support/async'
import ActivityFiltersPanel from '@/views/administration/pages/overview/components/ActivityFiltersPanel.vue'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useToastStore } from '@/shared/stores/toasts'
import type { ActivityFilterDraft } from '@/views/administration/helpers/activity-filters'

const auth = vi.hoisted(() => ({ $sessionKey: 'A', user: { id: 'A' }, isCurrentSession: vi.fn() }))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => auth }))
beforeEach(() => {
  auth.$sessionKey = 'A'
  auth.user = { id: 'A' }
  auth.isCurrentSession.mockImplementation((key) => auth.$sessionKey === key)
})
const empty: ActivityFilterDraft = {
  domain: '',
  event: '',
  actorId: '',
  actorType: '',
  occurredFrom: '',
  occurredTo: '',
}

function setup(initialFilters = empty) {
  const onApply = vi
    .fn<(draft: ActivityFilterDraft) => Promise<void>>()
    .mockResolvedValue(undefined)
  const onClear = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
  const wrapper = mountLibrary(
    defineComponent({
      setup() {
        useOffcanvas().open({ view: ActivityFiltersPanel })
        return () => h(ActivityFiltersPanel, { initialFilters, onApply, onClear })
      },
    }),
  )
  return { wrapper, onApply, onClear, store: useOffcanvas(), toasts: useToastStore() }
}

describe('activity filter submissions', () => {
  it('preserves the original draft and validates before applying, while clear remains available', async () => {
    const initial = { ...empty, occurredFrom: '2026-10-20', occurredTo: '2026-10-19' }
    const { wrapper, onApply, onClear } = setup(initial)
    await wrapper.get('form').trigger('submit')
    expect(onApply).not.toHaveBeenCalled()
    expect(wrapper.find('[role=alert]').exists()).toBe(true)
    const clear = wrapper.findAll('button').find((button) => button.text() === 'Clear filters')!
    await clear.trigger('click')
    await flushPromises()
    expect(onClear).toHaveBeenCalledOnce()
    expect(wrapper.find('[role=alert]').exists()).toBe(false)
    expect(initial).toEqual({ ...empty, occurredFrom: '2026-10-20', occurredTo: '2026-10-19' })
  })

  it('deduplicates applies, retains inline errors and draft, then recovers on retry', async () => {
    const { wrapper, onApply, store, toasts } = setup()
    const wait = deferred<void>()
    onApply.mockReturnValueOnce(wait.promise)
    await wrapper.get('input[name=actorId]').setValue('actor-one')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    expect(onApply).toHaveBeenCalledExactlyOnceWith({ ...empty, actorId: 'actor-one' })
    expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeDefined()
    wait.reject(new Error('failed'))
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toBeTruthy()
    expect(store.isOpen).toBe(true)
    expect(toasts.hasToasts).toBe(false)
    expect((wrapper.get('input[name=actorId]').element as HTMLInputElement).value).toBe('actor-one')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(onApply).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role=alert]').exists()).toBe(false)
  })

  it.each(['closed', 'replaced', 'session'] as const)(
    'does not expose late errors after %s',
    async (change) => {
      const { wrapper, onApply, store, toasts } = setup()
      const wait = deferred<void>()
      onApply.mockReturnValueOnce(wait.promise)
      await wrapper.get('form').trigger('submit')
      if (change === 'closed') store.close()
      if (change === 'replaced') store.open({ view: ActivityFiltersPanel })
      if (change === 'session') auth.$sessionKey = 'B'
      wait.reject(new Error('private old error'))
      await flushPromises()
      expect(wrapper.find('[role=alert]').exists()).toBe(false)
      expect(toasts.hasToasts).toBe(false)
      if (change === 'replaced') expect(store.isOpen).toBe(true)
      await wrapper.get('form').trigger('submit')
      expect(onApply).toHaveBeenCalledOnce()
    },
  )
})
