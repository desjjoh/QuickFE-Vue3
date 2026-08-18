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
  occurredAt: string
}

export type CurrentUserActivityRecord = Omit<AuditRecord, 'actorType' | 'actorId'>
export type AccountActivityResponse = Paginated<CurrentUserActivityRecord>
export type AuditPage = Paginated<AuditRecord>

export const auditEventLabels: Readonly<Record<string, string>> = {
  'identity.registration.verification_succeeded': 'Registration verified',
  'identity.sign_in.succeeded': 'Signed in',
  'identity.sign_out.completed': 'Signed out',
  'identity.password_reset.requested': 'Password reset requested',
  'identity.password_reset.completed': 'Password reset completed',
  'identity.password.changed': 'Password changed',
  'identity.email_change.completed': 'Email changed',
  'identity.mfa.enabled': 'Multi-factor authentication enabled',
  'identity.mfa.disabled': 'Multi-factor authentication disabled',
  'identity.session.revoked': 'Session revoked',
  'identity.session.all_revoked': 'All sessions revoked',
  'identity.account.deleted': 'Account deleted',
  'identity.profile.name_changed': 'Name changed',
  'identity.profile.personal_information_changed': 'Personal information changed',
  'identity.profile.country_changed': 'Country changed',
  'identity.profile.timezone_changed': 'Time zone changed',
  'identity.profile.avatar_assigned': 'Avatar assigned',
  'identity.profile.avatar_replaced': 'Avatar replaced',
  'identity.profile.avatar_removed': 'Avatar removed',
  'identity.profile.phone_created': 'Phone created',
  'identity.profile.phone_updated': 'Phone updated',
  'identity.profile.phone_removed': 'Phone removed',
  'identity.profile.address_created': 'Address created',
  'identity.profile.address_updated': 'Address updated',
  'identity.profile.address_removed': 'Address removed',
  'identity.admin.user_updated': 'User updated by administrator',
  'identity.admin.user_deleted': 'User deleted by administrator',
}

export const auditEventLabel = (event: string): string => auditEventLabels[event] ?? event
