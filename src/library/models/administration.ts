import { UserDto, type User } from './user'
import type { SortOrder } from './pagination'

export const administrationReasonCodes = [
  'security_response',
  'policy_enforcement',
  'access_review',
  'user_request',
  'data_correction',
] as const
export type AdministrationReasonCode = (typeof administrationReasonCodes)[number]

/** This revision belongs to status/role administration, not profile edits. */
export interface UserAdministration extends User {
  version: number
}

export class UserAdministrationDto extends UserDto {
  public readonly version: number

  public constructor(payload: UserAdministration) {
    super(payload)
    this.version = payload.version
  }
}

export interface UserAdministrationAction {
  expected_version: number
  reason_code: AdministrationReasonCode
}

export class UserAdministrationActionDto implements UserAdministrationAction {
  public readonly expected_version: number
  public readonly reason_code: AdministrationReasonCode

  public constructor(payload: UserAdministrationAction) {
    this.expected_version = payload.expected_version
    this.reason_code = payload.reason_code
  }
}

export interface AdministrationUserUpdate extends UserAdministrationAction {
  status_id?: string
  role_ids?: string[]
}

export class UpdateUserAdministrationDto extends UserAdministrationActionDto {
  public readonly status_id?: string
  public readonly role_ids?: string[]

  public constructor(payload: AdministrationUserUpdate) {
    super(payload)
    this.status_id = payload.status_id
    this.role_ids = payload.role_ids ? [...payload.role_ids] : undefined
  }
}

export type AdministrationUserSort =
  | 'user.createdAt'
  | 'profile.name.last'
  | 'user.identity.email'
  | 'fullname'
  | 'user.metadata.last_sign_in'
export type AdministrationSortOrder = SortOrder

export interface AdministrationUsersQuery {
  search?: string
  order?: SortOrder
  page?: number
  take?: number
  sort?: AdministrationUserSort
}

export class AdministrationUsersQueryDto implements AdministrationUsersQuery {
  public readonly search: string
  public readonly order: SortOrder
  public readonly page: number
  public readonly take: number
  public readonly sort: AdministrationUserSort

  public constructor(payload: AdministrationUsersQuery = {}) {
    this.search = payload.search ?? ''
    this.order = payload.order ?? 'ASC'
    this.page = payload.page ?? 1
    this.take = payload.take ?? 25
    this.sort = payload.sort ?? 'user.createdAt'
  }
}
