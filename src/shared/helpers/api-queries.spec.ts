import { describe, expect, it } from 'vitest'
import { toAdministrationUsersQuery, toAccountActivityQuery } from './api-queries'
import {
  normalizeAdministrationActivityQuery,
  toAdministrationAuditQuery,
} from '@/views/administration/stores/activity'

describe('UI query contracts', () => {
  it('maps audit search to the actor filter and retains URL filters after pagination changes', () => {
    const state = normalizeAdministrationActivityQuery(
      {
        page: '2',
        take: '500',
        search: 'actor-id',
        domain: 'identity',
        event: 'identity.admin.user_deleted',
        actorType: 'admin',
        sort: 'occurredAt',
        order: 'DESC',
      },
      { page: 1, take: 10 },
    )
    expect(toAdministrationAuditQuery(state)).toEqual({
      page: 2,
      take: 100,
      actorId: 'actor-id',
      domain: 'identity',
      event: 'identity.admin.user_deleted',
      actorType: 'admin',
      sort: 'occurredAt',
      order: 'DESC',
    })
  })

  it('does not pass arbitrary URL sorts and actor types into API filters', () => {
    expect(
      toAdministrationAuditQuery({ page: 1, take: 10, sort: 'unsafe', actorType: 'unsafe' }),
    ).toEqual({ page: 1, take: 10 })
    expect(toAdministrationUsersQuery({ page: 1, take: 500, sort: 'unsafe' }).sort).toBeUndefined()
    expect(
      toAdministrationUsersQuery({ page: 1, take: 500, sort: 'user.metadata.last_sign_in' }),
    ).toMatchObject({ sort: 'user.metadata.last_sign_in', take: 100 })
  })

  it('maps account activity using only its accepted query fields', () => {
    expect(
      toAccountActivityQuery({
        page: 2,
        take: 25,
        event: 'identity.sign_in.succeeded',
        sort: 'occurredAt',
        order: 'ASC',
        ...{ search: 'unsupported', actorId: 'other' },
      }),
    ).toMatchObject({
      page: 2,
      take: 25,
      event: 'identity.sign_in.succeeded',
      sort: 'occurredAt',
      order: 'ASC',
    })
    expect(
      toAccountActivityQuery({ page: 1, ...{ search: 'unsupported', actorId: 'other' } }),
    ).not.toHaveProperty('actorId')
  })
})
