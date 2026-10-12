import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { UserDto, SessionDto } from '@/library/models/user'
import { userFixture } from '@/shared/api/__tests__/fixtures'

const mocks = vi.hoisted(() => ({
  modal: { open: vi.fn(), close: vi.fn() },
  toast: { addToast: vi.fn() },
  auth: {
    getValidAccessToken: vi.fn(),
    getValidCsrfToken: vi.fn(),
    updateAuthenticatedUser: vi.fn(),
    purgeStore: vi.fn(),
  },
  settings: { sessions: [], loadSessions: vi.fn(), removeSession: vi.fn(), reset: vi.fn() },
  profile: { updatePhone: vi.fn(), uploadAvatar: vi.fn(), deletePhone: vi.fn() },
  sessions: { revoke: vi.fn(), revokeAll: vi.fn() },
}))
vi.mock('@/shared/api/useLocalhostAPI', () => ({
  useLocalHostAPI: () => ({ account: { profile: mocks.profile }, sessions: mocks.sessions }),
}))
vi.mock('@/shared/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/shared/stores/modal', () => ({ useModalStore: () => mocks.modal }))
vi.mock('@/shared/stores/toasts', () => ({ useToastStore: () => mocks.toast }))
vi.mock('@/shared/stores/library', () => ({
  useLibraryStore: () => ({ countries: [], genders: [], timezones: [] }),
}))
vi.mock('../stores/settings', () => ({ useSettingsStore: () => mocks.settings }))
vi.mock('@/shared/hooks/useErrorMessage', () => ({
  useErrorMessage: () => ({ getErrorMessage: () => 'Request failed' }),
}))

import { useSettingsActions } from './useProfileActions'
import { useSessions } from './useSessionsActions'

const user = new UserDto(userFixture)
const t = (key: string) => key
function submit(): (...args: unknown[]) => Promise<void> {
  return mocks.modal.open.mock.calls[mocks.modal.open.mock.calls.length - 1]![0].props
    .callbackSubmit
}
beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.getValidAccessToken.mockResolvedValue('access')
  mocks.auth.getValidCsrfToken.mockResolvedValue('csrf')
})

describe('profile form integration', () => {
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
