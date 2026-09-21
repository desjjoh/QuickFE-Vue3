import type { Paginated } from './pagination'

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
  ip: string
  countryCode: string | null
  countryName: string | null
  regionCode: string | null
  regionName: string | null
  city: string | null
  source: string
  resolvedAt: string
}

export interface AuditRecord {
  id: string
  domain: string
  event: string
  actorType: string
  actorId: string | null
  subjectType: string | null
  subjectId: string | null
  resourceType: string | null
  resourceId: string | null
  occurredAt: string
  operationId: string | null
  requestId: string | null
  sessionId: string | null
  ipAddress: string | null
  ipLocation: AuditIpLocationRecord | null
  userAgent: string | null
  browser: string | null
  browserVersion: string | null
  device: string | null
  os: string | null
  osVersion: string | null
  httpMethod: string | null
  route: string | null
  source: string
  before: Record<string, AuditValue>
  after: Record<string, AuditValue>
  changes: Record<string, AuditChange>
  metadata: Record<string, AuditValue>
  reasonCode: string | null
  createdAt: string
  updatedAt: string
}

export type CurrentUserActivityRecord = Omit<AuditRecord, 'actorType' | 'actorId'>

export class AuditIpLocationDto {
  public readonly ip: string
  public readonly countryCode: string | null
  public readonly countryName: string | null
  public readonly regionCode: string | null
  public readonly regionName: string | null
  public readonly city: string | null
  public readonly source: string
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
  public readonly actorType?: string
  public readonly actorId?: string | null
  public readonly subjectType: string | null
  public readonly subjectId: string | null
  public readonly resourceType: string | null
  public readonly resourceId: string | null
  public readonly occurredAt: Date
  public readonly operationId: string | null
  public readonly requestId: string | null
  public readonly sessionId: string | null
  public readonly ipAddress: string | null
  public readonly ipLocation: AuditIpLocationDto | null
  public readonly userAgent: string | null
  public readonly browser: string | null
  public readonly browserVersion: string | null
  public readonly device: string | null
  public readonly os: string | null
  public readonly osVersion: string | null
  public readonly httpMethod: string | null
  public readonly route: string | null
  public readonly source: string
  public readonly before: Record<string, AuditValue>
  public readonly after: Record<string, AuditValue>
  public readonly changes: Record<string, AuditChange>
  public readonly metadata: Record<string, AuditValue>
  public readonly reasonCode: string | null
  public readonly createdAt: Date
  public readonly updatedAt: Date

  public constructor(payload: AuditRecord | CurrentUserActivityRecord) {
    this.id = payload.id
    this.domain = payload.domain
    this.event = payload.event
    this.actorType = 'actorType' in payload ? payload.actorType : undefined
    this.actorId = 'actorId' in payload ? payload.actorId : undefined
    this.subjectType = payload.subjectType
    this.subjectId = payload.subjectId
    this.resourceType = payload.resourceType
    this.resourceId = payload.resourceId
    this.occurredAt = new Date(payload.occurredAt)
    this.operationId = payload.operationId
    this.requestId = payload.requestId
    this.sessionId = payload.sessionId
    this.ipAddress = payload.ipAddress
    this.ipLocation = payload.ipLocation ? new AuditIpLocationDto(payload.ipLocation) : null
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

export type AccountActivityResponse = Paginated<AuditDto>
export type AuditPage = Paginated<AuditDto>
