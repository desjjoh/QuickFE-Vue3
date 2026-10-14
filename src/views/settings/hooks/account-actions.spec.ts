import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { deferred } from '@test/support/async'

const mocks = vi.hoisted(() => ({
  modal: { open: vi.fn(), close: vi.fn(), closeAndWait: vi.fn() },
  auth: {
    getValidAccessToken: vi.fn(),
    getValidCsrfToken: vi.fn(),
    authenticate: vi.fn(),
    verifyToken: vi.fn(),
    purgeStore: vi.fn(),
  },
  toast: { addToast: vi.fn() },
  account: {
    changeEmail: vi.fn(),
    confirmEmail: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
    updateMfa: vi.fn(),
    confirmMfa: vi.fn(),
  },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ account: mocks.account }),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/shared/stores/modal', () => ({ useModalStore: () => mocks.modal }))
vi.mock('@/shared/stores/toasts', () => ({ useToastStore: () => mocks.toast }))
vi.mock('@/shared/hooks/useErrorMessage', () => ({
  useErrorMessage: () => ({ getErrorMessage: () => 'Rejected' }),
}))
import { useSettingsActions } from './useAccountActions'

const props = () => mocks.modal.open.mock.lastCall![0].props
const actions = () => useSettingsActions((key) => key)
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
})
describe('account security action contracts', () => {
  it.each(['updatePassword', 'deleteAccount', 'updateEmail'] as const)(
    '%s cancels without a request and retains the form after a conflict',
    async (action) => {
      const method = {
        updatePassword: 'changePassword',
        deleteAccount: 'deleteAccount',
        updateEmail: 'changeEmail',
      }[action] as keyof typeof mocks.account
      actions()[action]()
      props().callbackCancel()
      expect(mocks.account[method]).not.toHaveBeenCalled()
      mocks.modal.close.mockClear()
      mocks.account[method].mockRejectedValue({ response: { status: 409 } })
      const values = Object.freeze({
        password: 'password',
        email: 'new@example.com',
        newPassword: 'new-password',
      })
      await props().callbackSubmit(values)
      expect(mocks.account[method]).toHaveBeenCalledWith('access', 'csrf', values)
      expect(mocks.modal.close).not.toHaveBeenCalled()
      expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
      expect(mocks.auth.authenticate).not.toHaveBeenCalled()
      expect(mocks.toast.addToast).toHaveBeenCalledWith({ message: 'Rejected', tone: 'danger' })
    },
  )
  it.each(['updatePassword', 'deleteAccount'] as const)(
    '%s suppresses duplicate submissions and cleans up only after success',
    async (action) => {
      const response = deferred<object>()
      const method =
        action === 'updatePassword' ? mocks.account.changePassword : mocks.account.deleteAccount
      method.mockReturnValueOnce(response.promise)
      actions()[action]()
      const callback = props().callbackSubmit
      const values = { password: 'password' }
      const first = callback(values)
      await callback(values)
      await flushPromises()
      expect(method).toHaveBeenCalledTimes(1)
      expect(mocks.modal.close).not.toHaveBeenCalled()
      const jwt = { user: { id: 'user' } }
      response.resolve(jwt)
      await first
      expect(mocks.modal.close).toHaveBeenCalledOnce()
      if (action === 'deleteAccount') expect(mocks.auth.purgeStore).toHaveBeenCalledOnce()
      else expect(mocks.auth.authenticate).toHaveBeenCalledWith(jwt)
      expect(mocks.toast.addToast).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'success' }),
      )
    },
  )
  it('does not send destructive requests when credentials fail and permits retry', async () => {
    actions().deleteAccount()
    const callback = props().callbackSubmit
    mocks.auth.getValidCsrfToken.mockRejectedValueOnce(new Error('expired'))
    await callback({ password: 'password' })
    expect(mocks.account.deleteAccount).not.toHaveBeenCalled()
    expect(mocks.modal.close).not.toHaveBeenCalled()
    await callback({ password: 'password' })
    expect(mocks.account.deleteAccount).toHaveBeenCalledOnce()
    expect(mocks.auth.purgeStore).toHaveBeenCalledOnce()
  })
  it('opens email verification only after challenge creation and verifies with fresh credentials', async () => {
    const challenge = { challenge_id: 'challenge' }
    mocks.account.changeEmail.mockResolvedValueOnce(challenge)
    actions().updateEmail()
    await props().callbackSubmit({ email: 'new@example.com', password: 'password' })
    expect(mocks.modal.closeAndWait).toHaveBeenCalledOnce()
    expect(props()).toMatchObject({ challenge, email: 'new@example.com' })
    const otp = props()
    const input = { challenge_id: 'challenge', code: '123456' }
    const jwt = { user: { id: 'user' } }
    mocks.account.confirmEmail.mockResolvedValueOnce(jwt)
    expect(await otp.verify(input)).toBe(jwt)
    expect(mocks.account.confirmEmail).toHaveBeenCalledWith('access', 'csrf', input)
    await otp.onSuccess(jwt)
    expect(mocks.auth.authenticate).toHaveBeenCalledWith(jwt)
    expect(mocks.auth.verifyToken).toHaveBeenCalledOnce()
    otp.onCancel()
    otp.restart()
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-update-email')
  })
  it.each([true, false])(
    'MFA failures preserve the session and do not report success (enabled=%s)',
    async (enabled) => {
      actions().updateMfa(enabled)
      props().callbackCancel()
      expect(mocks.account.updateMfa).not.toHaveBeenCalled()
      mocks.modal.close.mockClear()
      mocks.account.updateMfa.mockRejectedValueOnce(new Error('denied'))
      await expect(props().callbackSubmit({ password: 'password' })).rejects.toThrow('denied')
      expect(mocks.modal.close).not.toHaveBeenCalled()
      expect(mocks.toast.addToast).not.toHaveBeenCalled()
    },
  )
  it('disables MFA and refreshes access before reporting success', async () => {
    actions().updateMfa(false)
    await props().callbackSubmit({ password: 'password' })
    expect(mocks.account.updateMfa).toHaveBeenCalledWith('access', 'csrf', {
      enabled: false,
      password: 'password',
    })
    expect(mocks.auth.verifyToken).toHaveBeenCalledOnce()
    expect(mocks.modal.close).toHaveBeenCalledOnce()
  })
  it('requires an enrollment challenge before showing MFA success', async () => {
    actions().updateMfa(true)
    await props().callbackSubmit({ password: 'password' })
    expect(mocks.modal.close).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).not.toHaveBeenCalled()
    const challenge = { challenge_id: 'mfa' }
    mocks.account.updateMfa.mockResolvedValueOnce(challenge)
    await props().callbackSubmit({ password: 'password' })
    expect(props().challenge).toBe(challenge)
    const otp = props()
    const input = { challenge_id: 'mfa', code: '123456' }
    await otp.verify(input)
    expect(mocks.account.confirmMfa).toHaveBeenCalledWith('access', 'csrf', input)
    await otp.onSuccess()
    expect(mocks.auth.verifyToken).toHaveBeenCalledOnce()
    expect(mocks.toast.addToast).toHaveBeenCalledWith({
      message: 'settings.security.items.twoFactor.enabled',
      tone: 'success',
    })
    otp.onCancel()
  })
})
