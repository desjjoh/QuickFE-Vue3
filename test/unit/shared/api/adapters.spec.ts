import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { instance } from '@/shared/api/useLocalhostAPI'
import { useAdministrationRoutes } from '@/shared/api/routes/useAdministrationRoutes'
import { useAccountRoutes } from '@/shared/api/routes/useAccountRoutes'
import { useSessionRoutes } from '@/shared/api/routes/useSessionRoutes'
import { useAuthRoutes } from '@/shared/api/routes/useAuthRoutes'
import { useSecurityRoutes } from '@/shared/api/routes/useSecurityRoutes'
import { usePublicRoutes } from '@/shared/api/routes/usePublicRoutes'
import {
  AccountStatusDto,
  CountryDto,
  GenderDto,
  RoleDto,
  TimezoneDto,
} from '@/library/models/reference'
import { UserAdministrationDto } from '@/library/models/administration'
import { SessionDto, UserDto } from '@/library/models/user'
import { userFixture } from '@test/support/api-fixtures'

const originalAdapter = instance.defaults.adapter
const requests: InternalAxiosRequestConfig[] = []
let responseData: unknown
const adapter = vi.fn<AxiosAdapter>(async (config) => {
  requests.push(config)
  return { data: responseData, status: 200, statusText: 'OK', headers: {}, config }
})

beforeEach(() => {
  requests.length = 0
  adapter.mockClear()
  responseData = { ...userFixture, version: 8 }
  instance.defaults.adapter = adapter
})
afterEach(() => {
  instance.defaults.adapter = originalAdapter
})

describe('public library adapters', () => {
  it.each([
    ['getCountries', 'countries', userFixture.profile.region.country, CountryDto],
    ['getGenders', 'genders', userFixture.profile.personal.gender, GenderDto],
    [
      'getRoles',
      'roles',
      { ...userFixture.status, key: 'article_creator', permissions: [] },
      RoleDto,
    ],
    ['getStatuses', 'statuses', userFixture.status, AccountStatusDto],
    ['getTimezones', 'timezones', userFixture.profile.region.timezone, TimezoneDto],
  ] as const)(
    'hydrates %s from the public namespace without authentication',
    async (method, path, payload, Dto) => {
      responseData = [payload]
      const result = await usePublicRoutes().library[method]()
      expect(requests[0]).toMatchObject({ method: 'get', url: `public/library/${path}` })
      expect(result[0]).toBeInstanceOf(Dto)
      expect(requests[0]!.headers.has('Authorization')).toBe(false)
      expect(requests[0]!.headers.has('X-CSRF-Token')).toBe(false)
      expect(requests[0]!.headers.has('Idempotency-Key')).toBe(false)
    },
  )
})

describe('administration adapters', () => {
  it('sends version and controlled reason with the supplied key and hydrates the returned revision', async () => {
    const result = await useAdministrationRoutes().users.updateUser(
      'access',
      userFixture.id,
      { expected_version: 7, reason_code: 'access_review', role_ids: [] },
      { idempotencyKey: 'user-edit-7' },
    )
    expect(requests[0]).toMatchObject({
      method: 'patch',
      url: `administration/users/${userFixture.id}`,
    })
    expect(JSON.parse(requests[0]!.data)).toEqual({
      expected_version: 7,
      reason_code: 'access_review',
      role_ids: [],
    })
    expect(requests[0]!.headers.get('Idempotency-Key')).toBe('user-edit-7')
    expect(requests[0]!.headers.get('Authorization')).toBe('Bearer access')
    expect(requests[0]!.headers.get('Content-Type')).toBe('application/json')
    expect(result).toBeInstanceOf(UserAdministrationDto)
    expect(result.version).toBe(8)
  })

  it('supports bodyless deletion responses without losing the expected version', async () => {
    responseData = undefined
    const result = await useAdministrationRoutes().users.deleteUser(
      'access',
      userFixture.id,
      { expected_version: 8, reason_code: 'policy_enforcement' },
      { idempotencyKey: 'delete-8' },
    )
    expect(result).toBeUndefined()
    expect(requests[0]!.url).toBe(`administration/users/${userFixture.id}/delete`)
    expect(JSON.parse(requests[0]!.data).expected_version).toBe(8)
    expect(requests[0]!.headers.get('Idempotency-Key')).toBe('delete-8')
  })

  it('generates distinct keys for separate calls and allows the caller to reuse one explicitly', async () => {
    const users = useAdministrationRoutes().users
    const payload = { expected_version: 7, reason_code: 'access_review' as const }
    await users.updateUser('access', userFixture.id, payload)
    await users.updateUser('access', userFixture.id, payload)
    const key = requests[0]!.headers.get('Idempotency-Key') as string
    expect(key).toMatch(/^[0-9a-f-]{36}$/)
    expect(requests[1]!.headers.get('Idempotency-Key')).not.toBe(key)
    await users.updateUser('access', userFixture.id, payload, { idempotencyKey: key })
    expect(requests[2]!.headers.get('Idempotency-Key')).toBe(key)
    expect(requests[2]!.data).toBe(requests[0]!.data)
  })

  it.each([409, 422])(
    'passes HTTP %s back unchanged without retrying or inventing a new version',
    async (status) => {
      const failure = new AxiosError('Rejected action', 'ERR_BAD_REQUEST')
      adapter.mockRejectedValueOnce(failure)
      failure.response = {
        data: { statusCode: status, message: 'Reload before retrying' },
        status,
        statusText: 'Rejected',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }
      await expect(
        useAdministrationRoutes().users.updateUser('access', userFixture.id, {
          expected_version: 7,
          reason_code: 'access_review',
        }),
      ).rejects.toBe(failure)
      expect(adapter).toHaveBeenCalledTimes(1)
    },
  )

  it('hydrates administration reads without adding mutation headers', async () => {
    const result = await useAdministrationRoutes().users.getUser('access', userFixture.id)
    expect(result.version).toBe(8)
    expect(requests[0]!.headers.has('Idempotency-Key')).toBe(false)
    expect(requests[0]!.headers.has('Content-Type')).toBe(false)
  })
})

describe('profile and session adapters', () => {
  it('hydrates the backend session array, including activity status and timestamp strings', async () => {
    responseData = [
      {
        id: userFixture.id,
        createdAt: userFixture.createdAt,
        updatedAt: userFixture.updatedAt,
        active: true,
        browser: 'Firefox',
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
        locationSource: 'unknown',
        locationResolvedAt: null,
        userAgent: null,
        origin: null,
      },
    ]
    const sessions = await useSessionRoutes().list('access', 'csrf')
    expect(sessions[0]).toBeInstanceOf(SessionDto)
    expect(sessions[0]?.active).toBe(true)
    expect(sessions[0]?.createdAt.toISOString()).toBe(userFixture.createdAt)
    expect(requests[0]).toMatchObject({
      method: 'get',
      url: 'account/sessions',
      withCredentials: true,
    })
  })
  it('uploads the actual avatar with multipart, CSRF, credentials and a stable key', async () => {
    const file = new File(['avatar bytes'], 'avatar.png', { type: 'image/png' })
    const result = await useAccountRoutes().profile.uploadAvatar('access', 'csrf', file, {
      idempotencyKey: 'avatar-replacement',
    })
    const request = requests[0]!
    expect(request.data).toBeInstanceOf(FormData)
    expect(request.data.get('avatar')).toBe(file)
    expect(request.headers.get('Content-Type')).toBe('multipart/form-data')
    expect(request.headers.get('Idempotency-Key')).toBe('avatar-replacement')
    expect(request.headers.get('X-CSRF-Token')).toBe('csrf')
    expect(request.withCredentials).toBe(true)
    expect(result).toBeInstanceOf(UserDto)
  })

  it.each(['deleteAvatar', 'deletePhone', 'deleteAddress'] as const)(
    'keys supported %s mutations',
    async (method) => {
      await useAccountRoutes().profile[method]('access', 'csrf', { idempotencyKey: method })
      expect(requests[0]!.headers.get('Idempotency-Key')).toBe(method)
      expect(requests[0]!.method).toBe('delete')
    },
  )

  it('keys phone and address updates and retains their request contracts', async () => {
    const profile = useAccountRoutes().profile
    const phone = {
      phone_country_id: userFixture.id,
      phone_calling_code: '+1',
      phone_national_number: '4165551234',
      phone_e164: '+14165551234',
    }
    await profile.updatePhone('access', 'csrf', phone, { idempotencyKey: 'phone-set' })
    const address = {
      address_line_1: '123 Test St',
      address_line_2: null,
      city: 'Toronto',
      region_id: userFixture.id,
      postal_code: 'M5V1A1',
      country_id: userFixture.id,
    }
    await profile.updateAddress('access', 'csrf', address, { idempotencyKey: 'address-set' })
    expect(requests.map((request) => request.url)).toEqual([
      'account/profile/phone',
      'account/profile/address',
    ])
    expect(JSON.parse(requests[0]!.data)).toEqual(phone)
    expect(JSON.parse(requests[1]!.data)).toEqual(address)
    expect(requests[1]!.headers.get('Idempotency-Key')).toBe('address-set')
  })

  it('does not add idempotency to unsupported profile or session operations', async () => {
    await useAccountRoutes().profile.updateCountry('access', 'csrf', { country_id: userFixture.id })
    await useAccountRoutes().profile.updateTimeZone('access', 'csrf', {
      timezone_id: userFixture.id,
    })
    responseData = undefined
    await useSessionRoutes().revokeAll('access', 'csrf')
    await useSessionRoutes().revoke('access', 'csrf', 'session/id')
    expect(requests.map((request) => request.url)).toEqual([
      'account/profile/country',
      'account/profile/timezone',
      'account/sessions',
      'account/sessions/session%2Fid',
    ])
    for (const request of requests) {
      expect(request.headers.has('Idempotency-Key')).toBe(false)
      expect(request.headers.get('X-CSRF-Token')).toBe('csrf')
      expect(request.withCredentials).toBe(true)
    }
    for (const request of requests.filter((request) => request.method === 'delete')) {
      expect(request.headers.has('Content-Type')).toBe(false)
    }
  })

  it.each(['', 'a b', 'a,b', 'é', 'x'.repeat(129)])(
    'rejects invalid explicit keys before sending a request: %s',
    async (key) => {
      await expect(
        useAdministrationRoutes().users.deleteUser(
          'access',
          userFixture.id,
          { expected_version: 7, reason_code: 'access_review' },
          { idempotencyKey: key },
        ),
      ).rejects.toThrow('Idempotency-Key')
      expect(adapter).not.toHaveBeenCalled()
    },
  )
})

describe('authentication and security contracts', () => {
  it('preserves the sign-in MFA challenge and hydrates the verified session', async () => {
    const auth = useAuthRoutes()
    const challenge = {
      mfa_required: true,
      challenge_id: 'challenge',
      method: 'email_otp',
      expires_at: '2026-10-12T12:00:00.000Z',
    }
    responseData = challenge
    expect(
      await auth.signIn('csrf', { email: 'user@example.test', password: 'example-password' }),
    ).toEqual(challenge)
    responseData = { refresh: 123, access_token: 'access', iat: 1, exp: 2, user: userFixture }
    const session = await auth.verifyMfa('csrf', { challenge_id: 'challenge', code: '123456' })
    expect(session.user).toBeInstanceOf(UserDto)
    expect(requests.map((request) => request.url)).toEqual([
      'authentication/sign-in',
      'authentication/sign-in/mfa/verify',
    ])
    expect(JSON.parse(requests[1]!.data)).toEqual({ challenge_id: 'challenge', code: '123456' })
  })

  it('connects registration request/resend/confirmation to the backend OTP contract', async () => {
    const registration = useAuthRoutes().registration
    const payload = {
      first_name: 'Test',
      last_name: 'User',
      email: 'user@example.test',
      password: 'example-password',
      gender_id: userFixture.id,
      dob: '2000-01-01',
      country_id: userFixture.id,
      timezone_id: userFixture.id,
    }
    responseData = {
      challenge_id: 'challenge',
      method: 'email_otp',
      expires_at: '2026-10-12T12:00:00.000Z',
      email: payload.email,
      message: 'Sent',
    }
    expect((await registration.request('csrf', payload)).challenge_id).toBe('challenge')
    await registration.resend('csrf', { email: payload.email })
    responseData = { refresh: 123, access_token: 'access', iat: 1, exp: 2, user: userFixture }
    expect(
      (await registration.confirm('csrf', { challenge_id: 'challenge', code: '123456' })).user,
    ).toBeInstanceOf(UserDto)
    expect(requests.map((request) => request.url)).toEqual([
      'authentication/registration/request',
      'authentication/registration/resend',
      'authentication/registration/confirm',
    ])
    expect(JSON.parse(requests[0]!.data)).toEqual(payload)
  })

  it('keeps password-reset authorization separate from the challenge query and current session', async () => {
    const reset = useAuthRoutes().passwordReset
    responseData = { message: 'Sent' }
    await reset.request('csrf', { email: 'user@example.test' })
    responseData = {
      challenge_id: 'challenge',
      authorization: 'authorization',
      expires_at: '2026-10-12T12:00:00.000Z',
    }
    const authorization = await reset.verify('csrf', { email: 'user@example.test', code: '123456' })
    responseData = { message: 'Reset' }
    await reset.confirm('csrf', authorization.challenge_id, {
      authorization: authorization.authorization,
      password: 'example-password',
      confirm: 'example-password',
    })
    expect(requests.map((request) => request.url)).toEqual([
      'authentication/password-reset/request',
      'authentication/password-reset/verify',
      'authentication/password-reset/confirm',
    ])
    expect(requests[2]!.method).toBe('patch')
    expect(requests[2]!.params).toEqual({ challenge_id: 'challenge' })
    expect(JSON.parse(requests[2]!.data)).toEqual({
      authorization: 'authorization',
      password: 'example-password',
      confirm: 'example-password',
    })
    expect(requests[2]).toHaveProperty('__quickfePreserveSessionOnUnauthorized', true)
  })

  it('hydrates rotated account tokens after email confirmation and password change', async () => {
    const account = useAccountRoutes()
    responseData = {
      challenge_id: 'challenge',
      method: 'email_otp',
      expires_at: '2026-10-12T12:00:00.000Z',
    }
    const challenge = await account.changeEmail('access', 'csrf', {
      email: 'new@example.test',
      password: 'example-password',
    })
    responseData = { refresh: 123, access_token: 'new-access', iat: 1, exp: 2, user: userFixture }
    expect(
      (
        await account.confirmEmail('access', 'csrf', {
          challenge_id: challenge.challenge_id,
          code: '123456',
        })
      ).access_token,
    ).toBe('new-access')
    expect(
      (
        await account.changePassword('access', 'csrf', {
          password: 'example-password',
          new_password: 'new-password',
          confirm: 'new-password',
        })
      ).user,
    ).toBeInstanceOf(UserDto)
    expect(requests.map((request) => request.url)).toEqual([
      'account/email',
      'account/email/confirm',
      'account/password',
    ])
    for (const request of requests) {
      expect(request.withCredentials).toBe(true)
      expect(request.headers.get('X-CSRF-Token')).toBe('csrf')
      expect(request.headers.has('Idempotency-Key')).toBe(false)
    }
  })

  it('handles an MFA enrollment challenge and a bodyless disable/confirm response', async () => {
    const account = useAccountRoutes()
    responseData = {
      mfa_required: true,
      challenge_id: 'challenge',
      method: 'email_otp',
      expires_at: '2026-10-12T12:00:00.000Z',
    }
    expect(
      await account.updateMfa('access', 'csrf', { enabled: true, password: 'example-password' }),
    ).toMatchObject({ mfa_required: true })
    responseData = undefined
    expect(
      await account.confirmMfa('access', 'csrf', { challenge_id: 'challenge', code: '123456' }),
    ).toBeUndefined()
    expect(
      await account.updateMfa('access', 'csrf', { enabled: false, password: 'example-password' }),
    ).toBeUndefined()
    expect(requests.map((request) => request.url)).toEqual([
      'account/mfa',
      'account/mfa/confirm',
      'account/mfa',
    ])
  })
  it('refreshes with POST, CSRF and cookies while preserving the unversioned authenticated user', async () => {
    responseData = { refresh: 123, access_token: 'access', iat: 1, exp: 2, user: userFixture }
    const result = await useAuthRoutes().verifyToken('csrf')
    expect(requests[0]).toMatchObject({
      method: 'post',
      url: 'authentication/refresh',
      withCredentials: true,
    })
    expect(requests[0]!.headers.get('X-CSRF-Token')).toBe('csrf')
    expect(requests[0]!.headers.has('Idempotency-Key')).toBe(false)
    expect(result.user).toBeInstanceOf(UserDto)
  })

  it('retrieves CSRF from the versioned security route', async () => {
    responseData = { token: 'csrf', iat: 1, exp: 2 }
    expect((await useSecurityRoutes().csrfToken()).token).toBe('csrf')
    expect(requests[0]).toMatchObject({
      method: 'get',
      url: 'security/csrf',
      withCredentials: true,
    })
  })
})
