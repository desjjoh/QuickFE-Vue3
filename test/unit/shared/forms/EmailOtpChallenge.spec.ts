import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import EmailOtpChallenge from '@/shared/forms/EmailOtpChallenge.vue'
import { mountLibrary } from '@test/support/mount'
import { deferred } from '@test/support/async'

const challenge = {
  challenge_id: 'challenge',
  method: 'email_otp',
  expires_at: '2027-01-01T00:00:00Z',
} as const

describe('verification completion lifecycle', () => {
  it.each(['success', 'failure'] as const)(
    'waits for asynchronous completion and catches its %s',
    async (result) => {
      const complete = deferred<void>()
      const onSuccess = vi.fn(() => complete.promise)
      const wrapper = mountLibrary(EmailOtpChallenge, {
        props: {
          challenge,
          title: 'Verify',
          description: 'Enter your code',
          verify: vi.fn().mockResolvedValue(undefined),
          onSuccess,
          onCancel: vi.fn(),
        },
      })
      await wrapper.get('input[name="code"]').setValue('123456')
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
      expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
      if (result === 'success') complete.resolve()
      else complete.reject(new Error('Completion rejected'))
      await flushPromises()
      expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
      if (result === 'failure')
        expect(wrapper.get('[role="alert"]').text()).toBe('Completion rejected')
      else expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    },
  )
})
