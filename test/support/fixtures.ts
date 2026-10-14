import { userFixture, auditFixture } from '@test/support/api-fixtures'
import type { User } from '@/library/models/user'
import type { AuditRecord } from '@/library/models/audit'

// Every call returns independent JSON contract data, including overrides.
export function buildUser(overrides: Partial<User> = {}): User {
  return structuredClone({ ...userFixture, ...overrides })
}

export function buildAudit(overrides: Partial<AuditRecord> = {}): AuditRecord {
  return structuredClone({ ...auditFixture, ...overrides })
}
