import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppActions } from '@/app/hooks/useAppActions'
import { useSettingsActions } from '@/views/settings/hooks/useAccountActions'
import { useSettings } from '@/views/settings/hooks/useSettingsActions'
import { usePlaygroundModals } from '@/views/playground/hooks/usePlaygroundModal'
import { usePlaygroundOffcanvas } from '@/views/playground/hooks/usePlaygroundOffcanvas'
import { usePlaygroundToasts } from '@/views/playground/hooks/usePlaygroundToasts'
import { mountHook } from '@test/support/mount'
import { useTestClock, deferred } from '@test/support/async'

const mocks = vi.hoisted(() => ({
  modal: {
    isOpen: false,
    $instanceKey: 'initial',
    open: vi.fn(),
    close: vi.fn(),
    closeAndWait: vi.fn(),
  },
  offcanvas: { open: vi.fn() },
  toast: { addToast: vi.fn() },
  auth: {
    isCurrentSession: vi.fn(),
    isAuthenticated: true,
    user: { id: 'account-A' },
    $sessionKey: 'session-A',
    getValidCsrfToken: vi.fn(),
    getValidAccessToken: vi.fn(),
    authenticate: vi.fn(),
    purgeStore: vi.fn(),
    verifyToken: vi.fn(),
  },
  authentication: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    verifyMfa: vi.fn(),
    registration: { request: vi.fn(), resend: vi.fn(), confirm: vi.fn() },
    passwordReset: { request: vi.fn(), verify: vi.fn(), confirm: vi.fn() },
  },
  account: {
    changePassword: vi.fn(),
    changeEmail: vi.fn(),
    confirmEmail: vi.fn(),
    deleteAccount: vi.fn(),
    updateMfa: vi.fn(),
    confirmMfa: vi.fn(),
  },
}))
vi.mock('@/shared/stores/modal', () => ({ useModalStore: () => mocks.modal }))
vi.mock('@/shared/stores/offcanvas', () => ({ useOffcanvas: () => mocks.offcanvas }))
vi.mock('@/shared/stores/toasts', () => ({ useToastStore: () => mocks.toast }))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ authentication: mocks.authentication, account: mocks.account }),
}))
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
  mocks.auth.user.id = 'account-A'
  mocks.auth.$sessionKey = 'session-A'
  mocks.auth.isCurrentSession.mockImplementation((key: string) => key === mocks.auth.$sessionKey)
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.modal.isOpen = false
  mocks.modal.$instanceKey = crypto.randomUUID()
  mocks.modal.open.mockImplementation(() => {
    mocks.modal.isOpen = true
    mocks.modal.$instanceKey = crypto.randomUUID()
  })
  mocks.modal.close.mockImplementation(() => {
    mocks.modal.isOpen = false
  })
  mocks.modal.closeAndWait.mockImplementation(async () => {
    mocks.modal.isOpen = false
  })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
function props() {
  return mocks.modal.open.mock.calls[mocks.modal.open.mock.calls.length - 1]![0].props
}
const t = (key: string) => key

describe('application authentication actions', () => {
  it.each(['signIn', 'signOut'] as const)(
    'ignores late %s success and failure after modal replacement or session change',
    async (action) => {
      for (const change of ['modal', 'account', 'same-account']) {
        for (const outcome of ['success', 'failure']) {
          const pendingResponse = deferred<never>()
          mocks.authentication[action].mockReturnValueOnce(pendingResponse.promise)
          const actions = useAppActions(t)
          actions[action]()
          const old = props()
          const pending = old.callbackSubmit({})
          await Promise.resolve()
          if (change === 'account') mocks.auth.user.id = 'account-B'
          if (change !== 'modal') mocks.auth.$sessionKey = crypto.randomUUID()
          actions.signIn()
          const replacement = mocks.modal.$instanceKey
          mocks.auth.authenticate.mockClear()
          mocks.auth.purgeStore.mockClear()
          mocks.toast.addToast.mockClear()
          mocks.modal.close.mockClear()
          if (outcome === 'success') pendingResponse.resolve(undefined as never)
          else pendingResponse.reject(new Error('old private failure'))
          await pending
          expect(mocks.auth.authenticate).not.toHaveBeenCalled()
          expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
          expect(mocks.toast.addToast).not.toHaveBeenCalled()
          expect(mocks.modal.close).not.toHaveBeenCalled()
          expect(mocks.modal.$instanceKey).toBe(replacement)
        }
      }
    },
  )
  it.each(['mfa', 'registration'] as const)(
    'keeps a replacement dialog intact after canceled %s verification settles',
    async (kind) => {
      for (const outcome of ['success', 'failure'] as const) {
        const actions = useAppActions(t)
        if (kind === 'mfa') {
          mocks.authentication.signIn.mockResolvedValue({
            mfa_required: true,
            challenge_id: 'old-challenge',
          })
          actions.signIn()
          await props().callbackSubmit({})
        } else {
          mocks.authentication.registration.resend.mockResolvedValue({
            challenge_id: 'old-challenge',
            email: 'old@example.test',
          })
          actions.resendRegistration()
          await props().callbackSubmit({ email: 'old@example.test' })
        }
        const old = props()
        const response = deferred<unknown>()
        const verify =
          kind === 'mfa'
            ? mocks.authentication.verifyMfa
            : mocks.authentication.registration.confirm
        verify.mockReturnValueOnce(response.promise)
        const pending = old.verify({ challenge_id: 'old-challenge', code: '123456' })
        const rejected = expect(pending).rejects.toThrow(
          outcome === 'success' ? 'workflow' : 'old verification failure',
        )
        await Promise.resolve()
        expect(verify).toHaveBeenLastCalledWith('csrf', {
          challenge_id: 'old-challenge',
          code: '123456',
        })
        old.onCancel()
        actions.signIn()
        const replacement = mocks.modal.$instanceKey
        mocks.modal.close.mockClear()
        mocks.toast.addToast.mockClear()
        if (outcome === 'success') response.resolve({ access_token: 'old-access' })
        else response.reject(new Error('old verification failure'))
        await rejected
        old.onSuccess({ access_token: 'old-access' })
        old.onCancel()
        expect(mocks.auth.authenticate).not.toHaveBeenCalled()
        expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
        expect(mocks.toast.addToast).not.toHaveBeenCalled()
        expect(mocks.modal.close).not.toHaveBeenCalled()
        expect(mocks.modal.$instanceKey).toBe(replacement)
      }
    },
  )
  it.each(['mfa', 'registration'] as const)(
    'does not dispatch canceled %s verification after CSRF arrives',
    async (kind) => {
      const actions = useAppActions(t)
      if (kind === 'mfa') {
        mocks.authentication.signIn.mockResolvedValue({
          mfa_required: true,
          challenge_id: 'challenge',
        })
        actions.signIn()
        await props().callbackSubmit({})
      } else {
        mocks.authentication.registration.resend.mockResolvedValue({
          challenge_id: 'challenge',
          email: 'old@example.test',
        })
        actions.resendRegistration()
        await props().callbackSubmit({ email: 'old@example.test' })
      }
      const old = props()
      const csrf = deferred<string>()
      mocks.auth.getValidCsrfToken.mockReturnValueOnce(csrf.promise)
      const pending = old.verify({ challenge_id: 'challenge', code: '123456' })
      const rejected = expect(pending).rejects.toThrow('workflow')
      old.onCancel()
      actions.signIn()
      csrf.resolve('late-csrf')
      await rejected
      expect(mocks.authentication.verifyMfa).not.toHaveBeenCalled()
      expect(mocks.authentication.registration.confirm).not.toHaveBeenCalled()
    },
  )
  it.each(['signIn', 'signOut'] as const)(
    'coalesces duplicate %s submissions and commits only once',
    async (action) => {
      const response = deferred<unknown>()
      mocks.authentication[action].mockReturnValueOnce(response.promise)
      const actions = useAppActions(t)
      actions[action]()
      const submit = props().callbackSubmit
      const first = submit({})
      const second = submit({})
      await Promise.resolve()
      expect(mocks.authentication[action]).toHaveBeenCalledOnce()
      response.resolve({ access_token: 'new-access' })
      await Promise.all([first, second])
      expect(mocks.modal.close).toHaveBeenCalledOnce()
      expect(mocks.toast.addToast).toHaveBeenCalledOnce()
      expect(
        action === 'signIn' ? mocks.auth.authenticate : mocks.auth.purgeStore,
      ).toHaveBeenCalledOnce()
    },
  )
  it('does not replace a newly opened workflow when an older modal transition finishes', async () => {
    const actions = useAppActions(t)
    actions.signIn()
    const closing = deferred<void>()
    mocks.modal.closeAndWait.mockReturnValueOnce(closing.promise)
    const navigation = props().callbackForgotPassword()
    actions.register()
    const replacement = mocks.modal.$instanceKey
    closing.resolve()
    await navigation
    expect(mocks.modal.$instanceKey).toBe(replacement)
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-register')
  })
  it.each(['success', 'failure'] as const)(
    'does not replace a newer registration challenge after an old resend %s',
    async (outcome) => {
      const actions = useAppActions(t)
      mocks.authentication.registration.resend.mockResolvedValueOnce({
        challenge_id: 'old',
        email: 'old@example.test',
      })
      actions.resendRegistration()
      await props().callbackSubmit({ email: 'old@example.test' })
      const old = props()
      const response = deferred<unknown>()
      mocks.authentication.registration.resend.mockReturnValueOnce(response.promise)
      const pending = old.resend()
      const rejected = expect(pending).rejects.toThrow(
        outcome === 'success' ? 'workflow' : 'old resend failure',
      )
      await Promise.resolve()
      old.onCancel()
      actions.resendRegistration()
      mocks.authentication.registration.resend.mockResolvedValueOnce({
        challenge_id: 'new',
        email: 'new@example.test',
      })
      await props().callbackSubmit({ email: 'new@example.test' })
      const replacement = mocks.modal.$instanceKey
      if (outcome === 'success')
        response.resolve({ challenge_id: 'obsolete', email: 'old@example.test' })
      else response.reject(new Error('old resend failure'))
      await rejected
      expect(props().challenge.challenge_id).toBe('new')
      expect(mocks.modal.$instanceKey).toBe(replacement)
      expect(mocks.auth.authenticate).not.toHaveBeenCalled()
    },
  )
  it('does not dispatch auth requests after credentials arrive for a canceled modal', async () => {
    const token = deferred<string>()
    mocks.auth.getValidCsrfToken.mockReturnValueOnce(token.promise)
    const actions = useAppActions(t)
    actions.signIn()
    const pending = props().callbackSubmit({})
    mocks.modal.close()
    token.resolve('late-csrf')
    await pending
    expect(mocks.authentication.signIn).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).not.toHaveBeenCalled()
  })
  it('prevents a canceled MFA verification and its completion callback from affecting a newer modal', async () => {
    mocks.authentication.signIn.mockResolvedValue({ mfa_required: true, challenge_id: 'challenge' })
    const actions = useAppActions(t)
    actions.signIn()
    await props().callbackSubmit({})
    const otp = props()
    const response = deferred<never>()
    mocks.authentication.verifyMfa.mockReturnValueOnce(response.promise)
    const pending = otp.verify({ code: '123456' })
    const rejected = expect(pending).rejects.toThrow('workflow')
    await Promise.resolve()
    otp.onCancel()
    actions.signIn()
    response.resolve(undefined as never)
    await rejected
    otp.onSuccess({ access_token: 'old' })
    expect(mocks.auth.authenticate).not.toHaveBeenCalled()
    expect(mocks.modal.isOpen).toBe(true)
  })
  it('does not open an OTP after a delayed registration request has been replaced', async () => {
    const challenge = deferred<never>()
    mocks.authentication.registration.resend.mockReturnValueOnce(challenge.promise)
    const actions = useAppActions(t)
    actions.resendRegistration()
    const pending = props().callbackSubmit({ email: 'old@example.test' })
    await Promise.resolve()
    actions.signIn()
    challenge.resolve(undefined as never)
    await pending
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-signin')
  })
  it('uses the email reset form submission to open its OTP stage', async () => {
    const actions = useAppActions(t)
    actions.forgotPassword()
    await props().callbackSubmit({ email: 'test@example.test' })
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-password-reset-otp')
  })
  it('discards a sign-in result when another tab has changed identity before its broadcast is delivered', async () => {
    const response = deferred<never>()
    mocks.authentication.signIn.mockReturnValueOnce(response.promise)
    const actions = useAppActions(t)
    actions.signIn()
    const pending = props().callbackSubmit({})
    await Promise.resolve()
    mocks.auth.isCurrentSession.mockReturnValue(false)
    response.resolve(undefined as never)
    await pending
    expect(mocks.auth.authenticate).not.toHaveBeenCalled()
    expect(mocks.modal.close).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).not.toHaveBeenCalled()
  })
  it('does not reopen a reset form after cancellation while the modal is closing', async () => {
    const actions = useAppActions(t)
    await actions.requestPasswordReset({ email: 'test@example.test' })
    const otp = props()
    const closing = deferred<void>()
    mocks.modal.closeAndWait.mockReturnValueOnce(closing.promise)
    const pending = otp.onSuccess({ challenge_id: 'reset', authorization: 'private' })
    otp.onCancel()
    closing.resolve()
    await pending
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-password-reset-otp')
  })
  it('does not submit canceled reset authorization after credentials arrive', async () => {
    const actions = useAppActions(t)
    await actions.requestPasswordReset({ email: 'test@example.test' })
    await props().onSuccess({ challenge_id: 'reset', authorization: 'private' })
    const reset = props()
    const token = deferred<string>()
    mocks.auth.getValidCsrfToken.mockReturnValueOnce(token.promise)
    const pending = reset.callbackSubmit({ password: 'new', confirmPassword: 'new' })
    reset.callbackCancel()
    token.resolve('csrf')
    await pending
    expect(mocks.authentication.passwordReset.confirm).not.toHaveBeenCalled()
  })
  it('connects sign-in navigation and cancellation callbacks without sending requests', async () => {
    const actions = useAppActions(t)
    actions.signIn()
    await props().callbackForgotPassword()
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-password-reset-email')
    await props().callbackCancel()
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-signin')
    await props().callbackResendRegistration()
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-resend-registration')
    actions.signIn()
    await props().callback()
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-register')
    await props().callback()
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-signin')
    actions.signOut()
    props().callbackCancel()
    expect(mocks.authentication.signOut).not.toHaveBeenCalled()
  })
  it('completes MFA only after successful verification and propagates denied OTPs', async () => {
    mocks.authentication.signIn.mockResolvedValue({ mfa_required: true, challenge_id: 'challenge' })
    useAppActions(t).signIn()
    await props().callbackSubmit({})
    const otp = props()
    mocks.authentication.verifyMfa.mockRejectedValueOnce(new Error('denied'))
    await expect(otp.verify({ code: '000000' })).rejects.toThrow('denied')
    expect(mocks.auth.authenticate).not.toHaveBeenCalled()
    const jwt = { access_token: 'new' }
    otp.onSuccess(jwt)
    expect(mocks.auth.authenticate).toHaveBeenCalledWith(jwt, { newSession: true })
    otp.onCancel()
  })
  it('constructs registration DTOs and delegates resend, verification, restart and completion', async () => {
    const actions = useAppActions(t)
    const challenge = { challenge_id: 'registration', email: 'test@example.test' }
    mocks.authentication.registration.request.mockResolvedValue(challenge)
    actions.register()
    await props().callbackSubmit({
      firstName: 'First',
      lastName: 'Last',
      email: challenge.email,
      password: 'password',
      gender: { id: 'gender' },
      country: { id: 'country' },
      timezone: { id: 'timezone' },
      dob: '2000-01-01',
    })
    expect(mocks.authentication.registration.request).toHaveBeenCalledWith(
      'csrf',
      expect.objectContaining({
        first_name: 'First',
        gender_id: 'gender',
        country_id: 'country',
        timezone_id: 'timezone',
      }),
    )
    const otp = props()
    await otp.resend()
    expect(mocks.authentication.registration.resend).toHaveBeenCalledWith('csrf', {
      email: challenge.email,
    })
    await otp.verify({ code: '123456' })
    expect(mocks.authentication.registration.confirm).toHaveBeenCalledWith('csrf', {
      code: '123456',
    })
    otp.onSuccess({ access_token: 'new' })
    expect(mocks.auth.authenticate).toHaveBeenCalledWith(
      { access_token: 'new' },
      { newSession: true },
    )
    otp.onCancel()
    otp.restart()
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('registration-otp-registration')
    actions.resendRegistration()
    mocks.authentication.registration.resend.mockResolvedValueOnce(challenge)
    await props().callbackSubmit({ email: challenge.email })
    expect(props().challenge).toBe(challenge)
  })
  it('retains reset authorization on rejection, clears it on success, and prevents reuse', async () => {
    const actions = useAppActions(t)
    await actions.requestPasswordReset({ email: ' test@example.test ' })
    const otp = props()
    await otp.verify({ code: '123456' })
    expect(mocks.authentication.passwordReset.verify).toHaveBeenCalledWith('csrf', {
      email: 'test@example.test',
      code: '123456',
    })
    await otp.onSuccess({ challenge_id: 'reset', authorization: 'private' })
    const callback = props().callbackSubmit
    mocks.authentication.passwordReset.confirm
      .mockRejectedValueOnce(new Error('rejected'))
      .mockResolvedValueOnce(undefined)
    const password = { password: 'new', confirmPassword: 'new' }
    await expect(callback(password)).rejects.toThrow('rejected')
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-password-reset-password')
    await callback(password)
    expect(mocks.authentication.passwordReset.confirm).toHaveBeenLastCalledWith('csrf', 'reset', {
      authorization: 'private',
      password: 'new',
      confirm: 'new',
    })
    expect(mocks.modal.open.mock.lastCall![0].key).toBe('modal-signin')
    await callback(password)
    expect(mocks.authentication.passwordReset.confirm).toHaveBeenCalledTimes(2)
    await actions.requestPasswordReset({ email: 'other@example.test' })
    props().onCancel()
    expect(mocks.auth.authenticate).not.toHaveBeenCalled()
  })
  it('authenticates on success and reports failed sign-in without authenticating', async () => {
    const actions = useAppActions(t)
    const response = { access_token: 'new' }
    mocks.authentication.signIn.mockResolvedValue(response)
    actions.signIn()
    await props().callbackSubmit({ email: 'test@example.test', password: 'secret' })
    expect(mocks.auth.authenticate).toHaveBeenCalledWith(response, { newSession: true })
    mocks.auth.authenticate.mockClear()
    mocks.authentication.signIn.mockRejectedValue(new Error('bad credentials'))
    actions.signIn()
    await props().callbackSubmit({})
    expect(mocks.auth.authenticate).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).toHaveBeenLastCalledWith({
      message: 'bad credentials',
      tone: 'danger',
    })
  })
  it('opens MFA instead of authenticating and delegates verification', async () => {
    const challenge = { mfa_required: true, challenge_id: 'challenge' }
    mocks.authentication.signIn.mockResolvedValue(challenge)
    useAppActions(t).signIn()
    await props().callbackSubmit({})
    expect(mocks.auth.authenticate).not.toHaveBeenCalled()
    expect(mocks.modal.open).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: 'modal-signin-mfa', persistent: true }),
    )
    await props().verify({ challenge_id: 'challenge', code: '123456' })
    expect(mocks.authentication.verifyMfa).toHaveBeenCalledWith('csrf', {
      challenge_id: 'challenge',
      code: '123456',
    })
  })
  it('purges the session only after successful logout', async () => {
    const actions = useAppActions(t)
    mocks.authentication.signOut.mockRejectedValue(new Error('offline'))
    actions.signOut()
    await props().callbackSubmit()
    expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
    mocks.authentication.signOut.mockResolvedValue(undefined)
    actions.signOut()
    await props().callbackSubmit()
    expect(mocks.auth.purgeStore).toHaveBeenCalledOnce()
  })
  it('does not advance failed password-reset requests and cancels stale reset authorization', async () => {
    const actions = useAppActions(t)
    mocks.authentication.passwordReset.request.mockRejectedValueOnce(new Error('offline'))
    await expect(actions.requestPasswordReset({ email: '  test@example.test  ' })).rejects.toThrow(
      'offline',
    )
    expect(mocks.modal.open).not.toHaveBeenCalled()
    mocks.authentication.passwordReset.request.mockResolvedValue(undefined)
    await actions.requestPasswordReset({ email: '  test@example.test  ' })
    expect(mocks.authentication.passwordReset.request).toHaveBeenLastCalledWith('csrf', {
      email: 'test@example.test',
    })
    await props().onSuccess({ challenge_id: 'id', authorization: 'private' })
    const submit = props().callbackSubmit
    props().callbackCancel()
    await submit({ password: 'new', confirmPassword: 'new' })
    expect(mocks.authentication.passwordReset.confirm).not.toHaveBeenCalled()
  })
})

describe('account actions and remaining shared projections', () => {
  it('rotates password credentials on success but never authenticates rejected mutations', async () => {
    const actions = useSettingsActions(t)
    const payload = { password: 'old', new_password: 'new', confirm: 'new' }
    const response = { access_token: 'new' }
    mocks.account.changePassword.mockResolvedValue(response)
    actions.updatePassword()
    await props().callbackSubmit(payload)
    expect(mocks.account.changePassword).toHaveBeenCalledWith('access', 'csrf', payload)
    expect(mocks.auth.authenticate).toHaveBeenCalledWith(response)
    mocks.auth.authenticate.mockClear()
    mocks.account.changePassword.mockRejectedValue(new Error('rejected'))
    actions.updatePassword()
    await props().callbackSubmit(payload)
    expect(mocks.auth.authenticate).not.toHaveBeenCalled()
  })
  it('rejects failed MFA changes without displaying success or removing the session', async () => {
    const actions = useSettingsActions(t)
    mocks.account.updateMfa.mockRejectedValueOnce(new Error('wrong password'))
    actions.updateMfa(false)
    await expect(props().callbackSubmit({ password: 'wrong' })).rejects.toThrow('wrong password')
    expect(mocks.auth.verifyToken).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).not.toHaveBeenCalled()
    mocks.account.updateMfa.mockResolvedValue(undefined)
    actions.updateMfa(false)
    await props().callbackSubmit({ password: 'right' })
    expect(mocks.auth.verifyToken).toHaveBeenCalledOnce()
  })
  it('does not delete locally when the API denies deletion or credentials cannot be retrieved', async () => {
    mocks.account.deleteAccount.mockRejectedValue(new Error('denied'))
    const actions = useSettingsActions(t)
    actions.deleteAccount()
    await props().callbackSubmit({ password: 'wrong' })
    expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
    mocks.account.changeEmail.mockClear()
    mocks.auth.getValidCsrfToken.mockRejectedValue(new Error('expired'))
    actions.updateEmail()
    await props().callbackSubmit({ email: 'new@example.test', password: 'secret' })
    expect(mocks.account.changeEmail).not.toHaveBeenCalled()
  })
  it('updates the shared settings refresh key with the deterministic clock', async () => {
    const clock = useTestClock()
    const first = useSettings()
    const second = useSettings()
    first.refreshSettingsView()
    const key = first.settingsViewKey.value
    await clock.advance(1)
    second.refreshSettingsView()
    expect(first.settingsViewKey.value).toBe(key + 1)
  })
  it('connects playground dialogs, placement and toast variants to their public actions', async () => {
    const modals = usePlaygroundModals()
    for (const open of Object.values(modals)) {
      open()
      await props().callbackSubmit()
      expect(mocks.modal.close).toHaveBeenCalled()
    }
    const offcanvas = usePlaygroundOffcanvas()
    for (const [name, open] of Object.entries(offcanvas)) {
      open()
      expect(mocks.offcanvas.open).toHaveBeenLastCalledWith(
        expect.objectContaining({ side: name.replace('open', '').toLowerCase() }),
      )
    }
    const { result } = mountHook(usePlaygroundToasts)
    for (const [name, show] of Object.entries(result)) {
      show()
      expect(mocks.toast.addToast).toHaveBeenLastCalledWith(
        expect.objectContaining({ tone: name.replace('Toast', '') }),
      )
    }
  })
})
