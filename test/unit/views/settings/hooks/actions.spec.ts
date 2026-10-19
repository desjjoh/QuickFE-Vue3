import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { UserDto, SessionDto } from '@/library/models/user'
import { userFixture } from '@test/support/api-fixtures'
import { deferred } from '@test/support/async'
import { flushPromises } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  modal: { open: vi.fn(), close: vi.fn() },
  toast: { addToast: vi.fn() },
  auth: {
    isAuthenticated: true,
    user: { id: 'account-A' },
    $sessionKey: 'session-A',
    getValidAccessToken: vi.fn(),
    getValidCsrfToken: vi.fn(),
    updateAuthenticatedUser: vi.fn(),
    purgeStore: vi.fn(),
  },
  settings: {
    sessions: [] as SessionDto[],
    loadSessions: vi.fn(),
    removeSession: vi.fn(),
    reset: vi.fn(),
  },
  profile: {
    updatePhone: vi.fn(),
    uploadAvatar: vi.fn(),
    deletePhone: vi.fn(),
    deleteAddress: vi.fn(),
    deleteAvatar: vi.fn(),
    updateCountry: vi.fn(),
    updateTimeZone: vi.fn(),
    updateProfile: vi.fn(),
    updateAddress: vi.fn(),
  },
  library: {
    countries: [] as UserDto['profile']['region']['country'][],
    genders: [] as UserDto['profile']['personal']['gender'][],
    timezones: [] as UserDto['profile']['region']['timezone'][],
  },
  sessions: { revoke: vi.fn(), revokeAll: vi.fn() },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ account: { profile: mocks.profile }, sessions: mocks.sessions }),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/shared/stores/modal', () => ({ useModalStore: () => mocks.modal }))
vi.mock('@/shared/stores/toasts', () => ({ useToastStore: () => mocks.toast }))
vi.mock('@/shared/stores/library', () => ({
  useLibraryStore: () => mocks.library,
}))
vi.mock('@/views/settings/stores/settings', () => ({ useSettingsStore: () => mocks.settings }))
vi.mock('@/shared/hooks/useErrorMessage', () => ({
  useErrorMessage: () => ({ getErrorMessage: () => 'Request failed' }),
}))

import { useSettingsActions } from '@/views/settings/hooks/useProfileActions'
import { useSessions } from '@/views/settings/hooks/useSessionsActions'

const user = new UserDto(userFixture)
const t = (key: string) => key
function submit(): (...args: unknown[]) => Promise<void> {
  return mocks.modal.open.mock.calls[mocks.modal.open.mock.calls.length - 1]![0].props
    .callbackSubmit
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.isAuthenticated = true
  mocks.auth.user.id = 'account-A'
  mocks.auth.$sessionKey = 'session-A'
  mocks.settings.sessions = []
  mocks.library.countries = [user.profile.region.country]
  mocks.library.genders = [user.profile.personal.gender]
  mocks.library.timezones = [user.profile.region.timezone]
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
})

describe('profile form integration', () => {
  it.each(['deletePhone', 'deleteAddress', 'deleteAvatar'] as const)(
    '%s cancels safely, preserves retry keys and cleans up on success',
    async (action) => {
      await useSettingsActions(t)[action]()
      mocks.modal.open.mock.lastCall![0].props.callbackCancel()
      expect(mocks.profile[action]).not.toHaveBeenCalled()
      mocks.modal.close.mockClear()
      const callback = submit()
      mocks.profile[action]
        .mockRejectedValueOnce({ response: { status: 409 } })
        .mockResolvedValueOnce(user)
      await callback()
      expect(mocks.modal.close).not.toHaveBeenCalled()
      expect(mocks.auth.updateAuthenticatedUser).not.toHaveBeenCalled()
      await callback()
      expect(mocks.profile[action].mock.calls[1]![2]).toEqual(
        mocks.profile[action].mock.calls[0]![2],
      )
      expect(mocks.auth.updateAuthenticatedUser).toHaveBeenCalledWith(user)
      expect(mocks.modal.close).toHaveBeenCalledOnce()
    },
  )
  it.each(['updateCountry', 'updateTimezone', 'updateProfileDetails'] as const)(
    '%s constructs DTOs and retains initial values after rejection',
    async (action) => {
      useSettingsActions(t)[action](user)
      const initial = mocks.modal.open.mock.lastCall![0].props.initialValues
      const callback = submit()
      const method = {
        updateCountry: 'updateCountry',
        updateTimezone: 'updateTimeZone',
        updateProfileDetails: 'updateProfile',
      }[action] as keyof typeof mocks.profile
      mocks.profile[method].mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(user)
      await callback(initial)
      expect(mocks.modal.close).not.toHaveBeenCalled()
      expect(mocks.modal.open.mock.lastCall![0].props.initialValues).toBe(initial)
      await callback(initial)
      const payload = mocks.profile[method].mock.calls[1]![2]
      expect(Object.getPrototypeOf(payload)).not.toBe(Object.prototype)
      expect(mocks.auth.updateAuthenticatedUser).toHaveBeenCalledWith(user)
      expect(mocks.modal.close).toHaveBeenCalledOnce()
    },
  )
  it('handles missing references and populated optional profile fields', () => {
    mocks.library.countries = []
    mocks.library.genders = []
    mocks.library.timezones = []
    const raw = structuredClone(userFixture)
    raw.profile.name.preferred = 'Preferred'
    raw.profile.personal.bio = 'Biography'
    const populated = new UserDto(raw)
    useSettingsActions(t).updateProfileDetails(populated)
    expect(mocks.modal.open.mock.lastCall![0].props.initialValues).toMatchObject({
      preferredName: 'Preferred',
      bio: 'Biography',
      gender: undefined,
    })
    useSettingsActions(t).updateCountry(user)
    expect(mocks.modal.open.mock.lastCall![0].props.initialValues.country).toBeUndefined()
    useSettingsActions(t).updateTimezone(user)
    expect(mocks.modal.open.mock.lastCall![0].props.initialValues.timezone).toBeUndefined()
  })
  it('serializes address DTOs, uses fresh keys for corrections and suppresses duplicate uploads', async () => {
    useSettingsActions(t).updateAddress(user)
    expect(mocks.modal.open.mock.lastCall![0].props.initialValues).toMatchObject({
      addressLine1: '',
      city: '',
      postalCode: '',
    })
    const address = {
      addressLine1: '1 Main',
      city: 'Toronto',
      postalCode: 'A1A1A1',
      country: user.profile.region.country,
      region: { id: 'region' },
    }
    const callback = submit()
    mocks.profile.updateAddress
      .mockRejectedValueOnce(new Error('uncertain'))
      .mockResolvedValueOnce(user)
    await callback(address)
    await callback({ ...address, addressLine1: '2 Main' })
    expect(mocks.profile.updateAddress.mock.calls[1]![3].idempotencyKey).not.toBe(
      mocks.profile.updateAddress.mock.calls[0]![3].idempotencyKey,
    )
    expect(mocks.profile.updateAddress.mock.calls[1]![2]).toMatchObject({
      address_line_1: '2 Main',
      region_id: 'region',
      country_id: user.id,
    })
    const response = deferred<UserDto>()
    mocks.profile.uploadAvatar.mockReturnValueOnce(response.promise)
    useSettingsActions(t).updateAvatar()
    const upload = submit()
    const file = new File(['avatar'], 'avatar.png')
    const pending = upload(file)
    await upload(file)
    await flushPromises()
    expect(mocks.profile.uploadAvatar).toHaveBeenCalledOnce()
    response.resolve(user)
    await pending
    expect(mocks.auth.updateAuthenticatedUser).toHaveBeenLastCalledWith(user)
  })
  it('keeps a failed form open and reuses its key for an unchanged retry', async () => {
    const actions = useSettingsActions(t)
    actions.updatePhone(user)
    const phone = {
      phone_country_id: user.id,
      phone_calling_code: '+1',
      phone_national_number: '4165551234',
      phone_e164: '+14165551234',
    }
    mocks.profile.updatePhone
      .mockRejectedValueOnce(new Error('Uncertain response'))
      .mockResolvedValueOnce(user)
    await submit()(phone)
    expect(mocks.modal.close).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).toHaveBeenCalledWith({ message: 'Request failed', tone: 'danger' })
    const key = mocks.profile.updatePhone.mock.calls[0]![3].idempotencyKey
    await submit()({ ...phone })
    expect(mocks.profile.updatePhone.mock.calls[1]![3].idempotencyKey).toBe(key)
    expect(mocks.auth.updateAuthenticatedUser).toHaveBeenCalledWith(user)
    expect(mocks.modal.close).toHaveBeenCalledTimes(1)
  })

  it('uses a new key when the user corrects the payload after a failure', async () => {
    useSettingsActions(t).updatePhone(user)
    mocks.profile.updatePhone.mockRejectedValue(new Error('Rejected'))
    const phone = {
      phone_country_id: user.id,
      phone_calling_code: '+1',
      phone_national_number: '4165551234',
      phone_e164: '+14165551234',
    }
    await submit()(phone)
    await submit()({ ...phone, phone_national_number: '4165559999', phone_e164: '+14165559999' })
    expect(mocks.profile.updatePhone.mock.calls[1]![3].idempotencyKey).not.toBe(
      mocks.profile.updatePhone.mock.calls[0]![3].idempotencyKey,
    )
  })

  it('retains an avatar action key for the same file and replaces it for a new selection', async () => {
    useSettingsActions(t).updateAvatar()
    mocks.profile.uploadAvatar.mockRejectedValue(new Error('Uncertain response'))
    const file = new File(['first'], 'avatar.png', { type: 'image/png' })
    await submit()(file)
    await submit()(file)
    await submit()(new File(['second'], 'avatar.png', { type: 'image/png' }))
    const keys = mocks.profile.uploadAvatar.mock.calls.map((call) => call[3].idempotencyKey)
    expect(keys[1]).toBe(keys[0])
    expect(keys[2]).not.toBe(keys[0])
    expect(mocks.modal.close).not.toHaveBeenCalled()
  })
})

describe('session action integration', () => {
  it.each([true, false])(
    'revokes current/noncurrent sessions only once after confirmation (current=%s)',
    async (current) => {
      const actions = useSessions(
        computed(() => user),
        t,
      )
      const session = { id: 'session', data: {} as SessionDto, isCurrent: current, isStale: false }
      actions.revokeSession(session)
      mocks.modal.open.mock.lastCall![0].props.callbackCancel()
      expect(mocks.sessions.revoke).not.toHaveBeenCalled()
      mocks.modal.close.mockClear()
      const result = deferred<void>()
      mocks.sessions.revoke.mockReturnValueOnce(result.promise)
      const callback = submit()
      const pending = callback()
      await callback()
      await flushPromises()
      expect(actions.revokingSessionId.value).toBe('session')
      expect(mocks.sessions.revoke).toHaveBeenCalledOnce()
      result.resolve()
      await pending
      expect(actions.revokingSessionId.value).toBeNull()
      expect(mocks.modal.close).toHaveBeenCalledOnce()
      if (current) {
        expect(mocks.auth.purgeStore).toHaveBeenCalledOnce()
        expect(mocks.settings.removeSession).not.toHaveBeenCalled()
      } else {
        expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
        expect(mocks.settings.removeSession).toHaveBeenCalledWith('session')
      }
    },
  )
  it('sorts current sessions first, handles stale boundaries and forwards reloads', async () => {
    const now = Date.now()
    mocks.settings.sessions = [
      { id: 'old', updatedAt: new Date(now - 15 * 60_000 - 1) },
      { id: 'current', updatedAt: new Date(now - 15 * 60_000) },
    ] as SessionDto[]
    const raw = structuredClone(userFixture)
    raw.session = {
      ...mocks.settings.sessions[1]!,
      createdAt: userFixture.createdAt,
      updatedAt: new Date(now).toISOString(),
    } as unknown as NonNullable<typeof raw.session>
    const actions = useSessions(
      computed(() => new UserDto(raw)),
      t,
    )
    expect(actions.sessions.value.map((item) => item.id)).toEqual(['current', 'old'])
    expect(actions.sessions.value[1]!.isStale).toBe(true)
    expect(
      useSessions(
        computed(() => user),
        t,
      ).sessions.value.every((item) => !item.isCurrent),
    ).toBe(true)
    await actions.loadSessions()
    expect(mocks.settings.loadSessions).toHaveBeenCalledOnce()
  })
  it('clears the all-session loading state after rejection and signs out only on success', async () => {
    const actions = useSessions(
      computed(() => user),
      t,
    )
    actions.revokeAllSessions()
    mocks.sessions.revokeAll
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(undefined)
    await submit()()
    expect(actions.isRevokingAll.value).toBe(false)
    expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
    await submit()()
    expect(mocks.sessions.revokeAll).toHaveBeenCalledWith('access', 'csrf')
    expect(mocks.auth.purgeStore).toHaveBeenCalledTimes(1)
    expect(mocks.settings.reset).toHaveBeenCalledTimes(1)
  })

  it('clears individual loading state after failure without removing the session locally', async () => {
    const actions = useSessions(
      computed(() => user),
      t,
    )
    const data = new SessionDto({
      id: user.id,
      createdAt: userFixture.createdAt,
      updatedAt: userFixture.updatedAt,
      active: true,
      browser: null,
      browserVersion: null,
      device: null,
      os: null,
      osVersion: null,
      ipAddress: null,
      countryCode: null,
      countryName: null,
      regionCode: null,
      regionName: null,
      city: null,
      locationSource: null,
      locationResolvedAt: null,
      userAgent: null,
      origin: null,
    })
    actions.revokeSession({ id: data.id, data, isCurrent: false, isStale: false })
    mocks.sessions.revoke.mockRejectedValueOnce(new Error('Offline'))
    await submit()()
    expect(actions.revokingSessionId.value).toBeNull()
    expect(mocks.settings.removeSession).not.toHaveBeenCalled()
    expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
  })
})

const profileMutations = [
  ['updateCountry', 'updateCountry'],
  ['updateTimezone', 'updateTimeZone'],
  ['updateProfileDetails', 'updateProfile'],
  ['updatePhone', 'updatePhone'],
  ['deletePhone', 'deletePhone'],
  ['updateAddress', 'updateAddress'],
  ['deleteAddress', 'deleteAddress'],
  ['updateAvatar', 'uploadAvatar'],
  ['deleteAvatar', 'deleteAvatar'],
] as const

describe('profile action session boundaries', () => {
  for (const phase of ['credentials', 'success', 'failure'] as const) {
    it.each(profileMutations)(
      `%s stops stale ${phase} work before affecting another session`,
      async (action, method) => {
        const actions = useSettingsActions(t)
        const open = {
          updateCountry: () => actions.updateCountry(user),
          updateTimezone: () => actions.updateTimezone(user),
          updateProfileDetails: () => actions.updateProfileDetails(user),
          updatePhone: () => actions.updatePhone(user),
          deletePhone: () => actions.deletePhone(),
          updateAddress: () => actions.updateAddress(user),
          deleteAddress: () => actions.deleteAddress(),
          updateAvatar: () => actions.updateAvatar(),
          deleteAvatar: () => actions.deleteAvatar(),
        }
        const credentials = deferred<string>()
        const response = deferred<UserDto>()
        if (phase === 'credentials')
          mocks.auth.getValidCsrfToken.mockReturnValueOnce(credentials.promise)
        else mocks.profile[method].mockReturnValueOnce(response.promise)
        await open[action]()
        const values =
          action === 'updateAvatar'
            ? new File(['avatar'], 'avatar.png')
            : {
                country: user.profile.region.country,
                timezone: user.profile.region.timezone,
                firstName: 'A',
                lastName: 'User',
                gender: user.profile.personal.gender,
                dob: '1990-01-01',
                addressLine1: '1 Main',
                city: 'Toronto',
                postalCode: 'A1A1A1',
                region: { id: 'region' },
              }
        const pending = submit()(values)
        await flushPromises()
        if (phase !== 'credentials') expect(mocks.profile[method]).toHaveBeenCalledOnce()
        mocks.auth.user.id = 'account-B'
        mocks.auth.$sessionKey = 'session-B'
        if (phase === 'credentials') credentials.resolve('new-csrf')
        else if (phase === 'failure') response.reject(new Error('old private error'))
        else response.resolve(user)
        await pending
        if (phase === 'credentials') expect(mocks.profile[method]).not.toHaveBeenCalled()
        expect(mocks.auth.updateAuthenticatedUser).not.toHaveBeenCalled()
        expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
        expect(mocks.modal.close).not.toHaveBeenCalled()
        expect(mocks.toast.addToast).not.toHaveBeenCalled()
      },
    )
  }
  it('rejects an old form after logout and sign-in to the same account', async () => {
    await useSettingsActions(t).deletePhone()
    const oldSubmit = submit()
    mocks.auth.$sessionKey = 'replacement-session'
    await oldSubmit()
    expect(mocks.auth.getValidAccessToken).not.toHaveBeenCalled()
    expect(mocks.profile.deletePhone).not.toHaveBeenCalled()
    expect(mocks.toast.addToast).not.toHaveBeenCalled()
  })
  it.each(['revokeSession', 'revokeAllSessions'] as const)(
    '%s cannot commit an older account response',
    async (action) => {
      const actions = useSessions(
        computed(() => user),
        t,
      )
      const response = deferred<void>()
      if (action === 'revokeSession') {
        mocks.sessions.revoke.mockReturnValueOnce(response.promise)
        actions.revokeSession({
          id: 'old',
          data: {} as SessionDto,
          isCurrent: true,
          isStale: false,
        })
      } else {
        mocks.sessions.revokeAll.mockReturnValueOnce(response.promise)
        actions.revokeAllSessions()
      }
      const pending = submit()()
      await flushPromises()
      mocks.auth.$sessionKey = 'replacement-session'
      response.resolve()
      await pending
      expect(mocks.auth.purgeStore).not.toHaveBeenCalled()
      expect(mocks.settings.reset).not.toHaveBeenCalled()
      expect(mocks.settings.removeSession).not.toHaveBeenCalled()
      expect(mocks.modal.close).not.toHaveBeenCalled()
      expect(mocks.toast.addToast).not.toHaveBeenCalled()
    },
  )
})
