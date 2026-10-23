import { PaginatedDto, type Paginated, type SortOrder } from './pagination'
import type { AdministrationReasonCode } from './administration'

export type AuditActorType = 'user' | 'anonymous' | 'service' | 'admin' | 'system'
export type AuditSubjectType = 'user' | 'article'
export type AuditResourceType =
  | 'identity.user'
  | 'identity.profile'
  | 'identity.phone'
  | 'identity.address'
  | 'identity.image'
  | 'identity.session'
  | 'identity.role'
  | 'identity.account_status'
  | 'media.image'
  | 'articles.article'
export type AuditSource =
  | 'http'
  | 'queue'
  | 'scheduled_job'
  | 'seed'
  | 'service'
  | 'migration'
  | 'system'
export type AuditData = Record<string, AuditValue>

export interface AuditUserStatus {
  key: string
  label: string
}
export interface AuditUserAvatar {
  id: string
  url: string
}
/** Display projection only: this is not an authenticated User record. */
export interface AuditUser {
  id: string
  name: string
  email: string
  avatar: AuditUserAvatar | null
  status: AuditUserStatus
}

export class AuditUserStatusDto implements AuditUserStatus {
  public readonly key: string
  public readonly label: string

  public constructor(payload: AuditUserStatus) {
    this.key = payload.key
    this.label = payload.label
  }
}

export class AuditUserAvatarDto implements AuditUserAvatar {
  public readonly id: string
  public readonly url: string

  public constructor(payload: AuditUserAvatar) {
    this.id = payload.id
    this.url = payload.url
  }
}

export class AuditUserDto {
  public readonly id: string
  public readonly name: string
  public readonly email: string
  public readonly avatar: AuditUserAvatarDto | null
  public readonly status: AuditUserStatusDto

  public constructor(payload: AuditUser) {
    this.id = payload.id
    this.name = payload.name
    this.email = payload.email
    this.avatar = payload.avatar ? new AuditUserAvatarDto(payload.avatar) : null
    this.status = new AuditUserStatusDto(payload.status)
  }
}

export type AuditValue =
  | string
  | number
  | boolean
  | null
  | AuditValue[]
  | { [key: string]: AuditValue }

export interface AuditChange {
  before: AuditValue
  after: AuditValue
}

export interface AuditIpLocationRecord {
  ip: string | null
  countryCode: string | null
  countryName: string | null
  regionCode: string | null
  regionName: string | null
  city: string | null
  source: 'maxmind' | 'unknown'
  resolvedAt: string
}

export interface AuditRecord {
  id: string
  domain: string
  event: string
  actorType: AuditActorType
  actorId: string | null
  actorUser: AuditUser | null
  subjectType: AuditSubjectType | null
  subjectId: string | null
  resourceType: AuditResourceType | null
  resourceId: string | null
  occurredAt: string
  operationId: string | null
  requestId: string | null
  sessionId: string | null
  ipAddress: string | null
  ipLocation: AuditIpLocationRecord
  userAgent: string | null
  browser: string | null
  browserVersion: string | null
  device: string | null
  os: string | null
  osVersion: string | null
  httpMethod: string | null
  route: string | null
  source: AuditSource
  before: AuditData | null
  after: AuditData | null
  changes: AuditData | null
  metadata: AuditData | null
  reasonCode: AdministrationReasonCode | null
  createdAt: string
  updatedAt: string
}

// The current backend returns the same audit event DTO for account activity.
export type CurrentUserActivityRecord = AuditRecord

export class AuditIpLocationDto {
  public readonly ip: string | null
  public readonly countryCode: string | null
  public readonly countryName: string | null
  public readonly regionCode: string | null
  public readonly regionName: string | null
  public readonly city: string | null
  public readonly source: 'maxmind' | 'unknown'
  public readonly resolvedAt: Date

  public constructor(payload: AuditIpLocationRecord) {
    this.ip = payload.ip
    this.countryCode = payload.countryCode
    this.countryName = payload.countryName
    this.regionCode = payload.regionCode
    this.regionName = payload.regionName
    this.city = payload.city
    this.source = payload.source
    this.resolvedAt = new Date(payload.resolvedAt)
  }
}

export class AuditDto {
  public readonly id: string
  public readonly domain: string
  public readonly event: string
  public readonly actorType: AuditActorType
  public readonly actorId: string | null
  public readonly actorUser: AuditUserDto | null
  public readonly subjectType: AuditSubjectType | null
  public readonly subjectId: string | null
  public readonly resourceType: AuditResourceType | null
  public readonly resourceId: string | null
  public readonly occurredAt: Date
  public readonly operationId: string | null
  public readonly requestId: string | null
  public readonly sessionId: string | null
  public readonly ipAddress: string | null
  public readonly ipLocation: AuditIpLocationDto
  public readonly userAgent: string | null
  public readonly browser: string | null
  public readonly browserVersion: string | null
  public readonly device: string | null
  public readonly os: string | null
  public readonly osVersion: string | null
  public readonly httpMethod: string | null
  public readonly route: string | null
  public readonly source: AuditSource
  public readonly before: AuditData | null
  public readonly after: AuditData | null
  public readonly changes: AuditData | null
  public readonly metadata: AuditData | null
  public readonly reasonCode: AdministrationReasonCode | null
  public readonly createdAt: Date
  public readonly updatedAt: Date

  public constructor(payload: AuditRecord) {
    this.id = payload.id
    this.domain = payload.domain
    this.event = payload.event
    this.actorType = payload.actorType
    this.actorId = payload.actorId
    this.actorUser = payload.actorUser ? new AuditUserDto(payload.actorUser) : null
    this.subjectType = payload.subjectType
    this.subjectId = payload.subjectId
    this.resourceType = payload.resourceType
    this.resourceId = payload.resourceId
    this.occurredAt = new Date(payload.occurredAt)
    this.operationId = payload.operationId
    this.requestId = payload.requestId
    this.sessionId = payload.sessionId
    this.ipAddress = payload.ipAddress
    this.ipLocation = new AuditIpLocationDto(payload.ipLocation)
    this.userAgent = payload.userAgent
    this.browser = payload.browser
    this.browserVersion = payload.browserVersion
    this.device = payload.device
    this.os = payload.os
    this.osVersion = payload.osVersion
    this.httpMethod = payload.httpMethod
    this.route = payload.route
    this.source = payload.source
    this.before = payload.before
    this.after = payload.after
    this.changes = payload.changes
    this.metadata = payload.metadata
    this.reasonCode = payload.reasonCode
    this.createdAt = new Date(payload.createdAt)
    this.updatedAt = new Date(payload.updatedAt)
  }
}

export class AuditPageDto extends PaginatedDto<AuditDto, AuditRecord> {
  public constructor(payload: Paginated<AuditRecord>) {
    super(payload, AuditDto)
  }
}

export type AccountActivityResponse = AuditPageDto
export type AuditPage = AuditPageDto

export type AuditSort = 'occurredAt' | 'createdAt' | 'domain' | 'event' | 'actorType'

export interface AccountActivityQuery {
  domain?: string
  event?: string
  occurredFrom?: string
  occurredTo?: string
  sort?: AuditSort
  order?: SortOrder
  page?: number
  take?: number
}

export class AccountActivityQueryDto implements AccountActivityQuery {
  public readonly domain?: string
  public readonly event?: string
  public readonly occurredFrom?: string
  public readonly occurredTo?: string
  public readonly sort: AuditSort
  public readonly order: SortOrder
  public readonly page: number
  public readonly take: number

  public constructor(payload: AccountActivityQuery = {}) {
    this.domain = payload.domain
    this.event = payload.event
    this.occurredFrom = payload.occurredFrom
    this.occurredTo = payload.occurredTo
    this.sort = payload.sort ?? 'occurredAt'
    this.order = payload.order ?? 'DESC'
    this.page = payload.page ?? 1
    this.take = payload.take ?? 25
  }
}

export interface AdministrationAuditQuery extends AccountActivityQuery {
  actorType?: AuditActorType
  actorId?: string
}

export class AdministrationAuditQueryDto extends AccountActivityQueryDto {
  public readonly actorType?: AuditActorType
  public readonly actorId?: string

  public constructor(payload: AdministrationAuditQuery = {}) {
    super(payload)
    this.actorType = payload.actorType
    this.actorId = payload.actorId
  }
}

export interface AdministrationUserActivityQuery extends AccountActivityQuery {
  actor?: string
}

export class AdministrationUserActivityQueryDto extends AccountActivityQueryDto {
  public readonly actor?: string

  public constructor(payload: AdministrationUserActivityQuery = {}) {
    super(payload)
    this.actor = payload.actor
  }
}
