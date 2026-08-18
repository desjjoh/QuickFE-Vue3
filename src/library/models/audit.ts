import type { Paginated } from './pagination'

export const auditOutcomes = ['succeeded', 'failed', 'denied', 'pending', 'unknown'] as const
export type AuditOutcome = (typeof auditOutcomes)[number]

export interface AuditRecord {
  id: string
  domain: string
  event: string
  outcome: AuditOutcome | string
  actorType?: string
  actorId?: string | null
  subjectType: string | null
  subjectId: string | null
  resourceType: string | null
  resourceId: string | null
  occurredAt: Date
}

export type CurrentUserActivityRecord = Omit<AuditRecord, 'actorType' | 'actorId'>

export class AuditDto implements AuditRecord {
  public readonly id: string
  public readonly domain: string
  public readonly event: string
  public readonly outcome: AuditOutcome | string
  public readonly actorType?: string
  public readonly actorId?: string | null
  public readonly subjectType: string | null
  public readonly subjectId: string | null
  public readonly resourceType: string | null
  public readonly resourceId: string | null
  public readonly occurredAt: Date

  public constructor(payload: AuditRecord) {
    this.id = payload.id
    this.domain = payload.domain
    this.event = payload.event
    this.outcome = payload.outcome
    this.actorType = payload.actorType
    this.actorId = payload.actorId
    this.subjectType = payload.subjectType
    this.subjectId = payload.subjectId
    this.resourceType = payload.resourceType
    this.resourceId = payload.resourceId
    this.occurredAt = new Date(payload.occurredAt)
  }
}

export type AccountActivityResponse = Paginated<AuditDto>
export type AuditPage = Paginated<AuditDto>
