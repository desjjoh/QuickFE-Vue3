import { describe, expect, it } from 'vitest'
import { BaseDto } from '@/library/models/base'
import { PaginationMetaDto, PaginatedDto } from '@/library/models/pagination'
import { JwtResponseDto, CsrfTokenDto } from '@/library/models/token'
import { isMfaChallenge, toSession } from '@/library/models/mfa'
import { ImageDto, UpdateUserPhoneDto, UserDto } from '@/library/models/user'
import { buildUser } from '@test/support/fixtures'

describe('model boundaries and immutable hydration', () => {
  it('hydrates nested token/user state without modifying JSON or fabricating optional contact/session data', () => {
    const payload = { access_token: 'token', refresh: 2, iat: 1, exp: 2, user: buildUser() }
    const snapshot = structuredClone(payload)
    const token = new JwtResponseDto(payload)
    expect(token.user).toBeInstanceOf(UserDto)
    expect(token.user.createdAt).toBeInstanceOf(Date)
    expect(payload).toEqual(snapshot)
    expect(token.user.profile.contact.phone).toBeNull()
    expect(token.user.session).toBeNull()
    expect(toSession(payload)).toEqual(token)
    expect(isMfaChallenge(payload)).toBe(false)
  })
  it('distinguishes MFA challenges from authenticated responses and preserves explicit expiry zero', () => {
    expect(
      isMfaChallenge({
        mfa_required: true,
        challenge_id: 'id',
        method: 'email_otp',
        expires_at: '2026-01-01',
      }),
    ).toBe(true)
    expect(new CsrfTokenDto({ token: '', iat: 0, exp: 0 })).toEqual({ token: '', iat: 0, exp: 0 })
  })
  it('preserves empty/last-page pagination and invokes the item constructor only for actual records', () => {
    const meta = {
      page: 1,
      take: 10,
      itemCount: 0,
      pageCount: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    }
    const empty = new PaginatedDto({ data: [], meta }, BaseDto)
    expect(empty.data).toEqual([])
    expect(empty.meta).toBeInstanceOf(PaginationMetaDto)
    expect(empty.meta.pageCount).toBe(0)
    const payload = {
      data: [{ id: 'one', createdAt: '2026-01-01', updatedAt: '2026-01-02' }],
      meta: { ...meta, itemCount: 1, pageCount: 1 },
    }
    expect(new PaginatedDto(payload, BaseDto).data[0]?.createdAt).toBeInstanceOf(Date)
    expect(payload.data[0]?.createdAt).toBe('2026-01-01')
  })
  it('preserves profile upload and phone fields and derives initials from the user name', () => {
    const image = {
      url: 'https://example.test/avatar.webp',
      alt_text: null,
      width: 256,
      height: 256,
      size_bytes: 123,
      mime_type: 'image/webp',
      storage_key: 'avatar',
      filename: 'avatar.webp',
    }
    const phone = {
      phone_country_id: 'ca',
      phone_calling_code: '+1',
      phone_national_number: '4165550100',
      phone_e164: '+14165550100',
    }
    expect(new ImageDto(image)).toEqual(image)
    expect(new UpdateUserPhoneDto(phone)).toEqual(phone)
    expect(new UserDto(buildUser()).getInitials()).toBe('TU')
  })

  it('hydrates populated profile security timestamps', () => {
    const user = buildUser()
    const date = '2026-10-12T12:00:00.000Z'
    const timestamps = {
      lastChangedEmail: date,
      lastChangedPassword: date,
      lastChangedMfa: date,
      deletedAt: date,
    }
    Object.assign(user.metadata, timestamps)
    expect(new UserDto(user).metadata).toMatchObject(
      Object.fromEntries(Object.keys(timestamps).map((key) => [key, new Date(date)])),
    )
  })

  it('surfaces malformed required contract shapes instead of returning partial DTOs', () => {
    expect(() => new JwtResponseDto({ user: null } as never)).toThrow()
    expect(() => new PaginatedDto({ data: null, meta: {} } as never, BaseDto)).toThrow()
  })
})
