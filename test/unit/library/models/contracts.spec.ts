import { describe, expect, it } from 'vitest'
import {
  AuditDto,
  AuditPageDto,
  AuditUserDto,
  AuditUserStatusDto,
  AuditUserAvatarDto,
  AccountActivityQueryDto,
  AdministrationAuditQueryDto,
  AdministrationUserActivityQueryDto,
  type AuditRecord,
} from '@/library/models/audit'
import {
  UserAdministrationDto,
  UpdateUserAdministrationDto,
  UserAdministrationActionDto,
  AdministrationUsersQueryDto,
  type UserAdministration,
} from '@/library/models/administration'
import { SessionDto, UserMetadataDto, type Session } from '@/library/models/user'
import { PaginationMetaDto } from '@/library/models/pagination'

const timestamp = '2026-10-12T12:00:00.000Z'
const base = { id: 'abcdefghijklmnop', createdAt: timestamp, updatedAt: timestamp }
const session: Session = {
  ...base,
  active: false,
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
  locationSource: 'unknown',
  locationResolvedAt: timestamp,
  userAgent: null,
  origin: null,
}
const audit: AuditRecord = {
  ...base,
  domain: 'identity',
  event: 'identity.admin.user_deleted',
  actorType: 'admin',
  actorId: base.id,
  actorUser: {
    id: base.id,
    name: 'Former Admin',
    email: 'deleted@example.test',
    avatar: null,
    status: { key: 'deleted', label: 'Deleted' },
  },
  subjectType: 'user',
  subjectId: 'other-user',
  resourceType: 'identity.user',
  resourceId: 'other-user',
  occurredAt: timestamp,
  operationId: 'operation',
  requestId: 'request',
  sessionId: null,
  ipAddress: null,
  ipLocation: {
    ip: null,
    countryCode: null,
    countryName: null,
    regionCode: null,
    regionName: null,
    city: null,
    source: 'unknown',
    resolvedAt: timestamp,
  },
  userAgent: null,
  browser: null,
  browserVersion: null,
  device: null,
  os: null,
  osVersion: null,
  httpMethod: 'POST',
  route: '/administration/users/other-user/delete',
  source: 'http',
  before: null,
  after: null,
  changes: null,
  metadata: null,
  reasonCode: 'policy_enforcement',
}
const metadata = {
  lastSignIn: timestamp,
  lastChangedEmail: null,
  lastChangedPassword: null,
  lastUpdatedAt: timestamp,
  lastChangedMfa: null,
  mfaEnabled: false,
  deletedAt: timestamp,
}

describe('backend response contracts', () => {
  it('hydrates retained audit actors separately from the affected user and preserves redactions', () => {
    const dto = new AuditDto(audit)
    expect(dto.actorUser).toBeInstanceOf(AuditUserDto)
    expect(dto.actorUser?.status).toBeInstanceOf(AuditUserStatusDto)
    expect(dto.actorUser?.status.key).toBe('deleted')
    expect(dto.actorUser?.avatar).toBeNull()
    expect(dto.subjectId).not.toBe(dto.actorUser?.id)
    expect([dto.before, dto.after, dto.changes, dto.metadata]).toEqual([null, null, null, null])
    expect(dto.ipLocation.ip).toBeNull()
    expect(dto.ipLocation.resolvedAt.toISOString()).toBe(timestamp)
    expect(dto.occurredAt.toISOString()).toBe(timestamp)
    expect(dto.createdAt.toISOString()).toBe(timestamp)
    expect(dto.operationId).toBe('operation')
    expect(dto.requestId).toBe('request')
  })

  it('hydrates actor avatars and accepts missing non-user actors without fabricating identities', () => {
    const dto = new AuditDto({
      ...audit,
      actorUser: {
        ...audit.actorUser!,
        avatar: { id: 'avatar', url: 'https://example.test/avatar' },
      },
    })
    expect(dto.actorUser?.avatar).toBeInstanceOf(AuditUserAvatarDto)
    expect(
      new AuditDto({ ...audit, actorType: 'system', actorId: null, actorUser: null }).actorUser,
    ).toBeNull()
  })

  it('hydrates audit pages and retains backend pagination', () => {
    const dto = new AuditPageDto({
      data: [audit],
      meta: {
        page: 2,
        take: 25,
        itemCount: 26,
        pageCount: 2,
        hasPreviousPage: true,
        hasNextPage: false,
      },
    })
    expect(dto.data[0]).toBeInstanceOf(AuditDto)
    expect(dto.meta).toBeInstanceOf(PaginationMetaDto)
    expect(dto.meta.hasPreviousPage).toBe(true)
  })

  it('retains inactive session status and converts JSON timestamps', () => {
    const dto = new SessionDto(session)
    expect(dto.active).toBe(false)
    expect(dto.createdAt.toISOString()).toBe(timestamp)
    expect(dto.locationResolvedAt?.toISOString()).toBe(timestamp)
    expect(new SessionDto({ ...session, locationResolvedAt: null }).locationResolvedAt).toBeNull()
    const userMetadata = new UserMetadataDto(metadata)
    expect(userMetadata.deletedAt?.toISOString()).toBe(timestamp)
    expect(userMetadata.lastChangedEmail).toBeNull()
  })

  it('preserves administration versions and nested user hydration', () => {
    const user: UserAdministration = {
      ...base,
      version: 7,
      identity: { email: 'user@example.test' },
      metadata,
      profile: {
        name: { first: 'Test', last: 'User', preferred: null },
        personal: {
          bio: null,
          dob: '2000-01-01',
          gender: { ...base, key: 'other', label: 'Other' },
        },
        contact: { phone: null, address: null },
        media: { avatar: null },
        region: {
          country: {
            ...base,
            key: 'canada',
            label: 'Canada',
            iso2: 'CA',
            iso3: 'CAN',
            calling_code: '+1',
            flag_url: '',
            regions: [],
            phone_national_placeholder: '',
            phone_national_pattern: '',
            phone_format_groups: [],
            postal_code_placeholder: '',
            postal_code_pattern: '',
            postal_code_format_groups: [],
            postal_code_format_separator: '',
          },
          timezone: {
            ...base,
            key: 'America/Toronto',
            label: 'Toronto',
            long_name: 'Eastern',
            region: 'America',
            exemplar_city: 'Toronto',
          },
        },
      },
      roles: [],
      session,
      status: { ...base, key: 'active', label: 'Active', description: null },
    }
    const dto = new UserAdministrationDto(user)
    expect(dto.version).toBe(7)
    expect(dto.session).toBeInstanceOf(SessionDto)
    expect(dto.metadata.deletedAt).toBeInstanceOf(Date)
    expect(dto.getFullName()).toBe('Test User')
    expect(dto.raw.createdAt).toBe(timestamp)
  })
})

describe('backend request contracts', () => {
  it('serializes expected version, controlled reason, and an intentional empty role replacement', () => {
    const payload = { expected_version: 7, reason_code: 'access_review' as const, role_ids: [] }
    const dto = new UpdateUserAdministrationDto(payload)
    expect(dto.role_ids).not.toBe(payload.role_ids)
    expect(JSON.parse(JSON.stringify(dto))).toEqual(payload)
    expect(new UserAdministrationActionDto(payload).expected_version).toBe(7)
  })

  it('matches backend query defaults while retaining explicit filters and ordering', () => {
    expect(new AdministrationUsersQueryDto()).toMatchObject({
      page: 1,
      take: 25,
      order: 'ASC',
      sort: 'user.createdAt',
    })
    expect(new AccountActivityQueryDto()).toMatchObject({
      page: 1,
      take: 25,
      order: 'DESC',
      sort: 'occurredAt',
    })
    expect(new AdministrationUsersQueryDto({ sort: 'user.metadata.last_sign_in' }).sort).toBe(
      'user.metadata.last_sign_in',
    )
    const query = new AdministrationAuditQueryDto({
      actorType: 'admin',
      actorId: base.id,
      sort: 'event',
      order: 'ASC',
      occurredFrom: timestamp,
    })
    expect(query).toMatchObject({
      actorType: 'admin',
      actorId: base.id,
      sort: 'event',
      order: 'ASC',
      occurredFrom: timestamp,
    })
    expect(new AdministrationUserActivityQueryDto({ actor: 'Former Admin' }).actor).toBe(
      'Former Admin',
    )
  })
})
