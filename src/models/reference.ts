import { BaseDto, type iBase } from './base'

export interface iCountry extends iBase {
  key: string
  label: string
  iso2: string
  iso3: string
  calling_code: string
}

export class CountryDto extends BaseDto implements iCountry {
  public readonly key: string
  public readonly label: string
  public readonly iso2: string
  public readonly iso3: string
  public readonly calling_code: string

  public constructor(payload: iCountry) {
    super(payload)

    this.key = payload.key
    this.label = payload.label
    this.iso2 = payload.iso2
    this.iso3 = payload.iso3
    this.calling_code = payload.calling_code
  }
}

export interface iGender extends iBase {
  key: string
  label: string
}

export class GenderDto extends BaseDto implements iGender {
  public readonly key: string
  public readonly label: string

  public constructor(payload: iGender) {
    super(payload)

    this.key = payload.key
    this.label = payload.label
  }
}

export interface iRole extends iBase {
  key: string
  label: string
  description: string | null
  permissions: string[]
}

export class RoleDto extends BaseDto implements iRole {
  public readonly key: string
  public readonly label: string
  public readonly description: string | null
  public readonly permissions: string[]

  public constructor(payload: iRole) {
    super(payload)

    this.key = payload.key
    this.label = payload.label
    this.description = payload.description ?? null
    this.permissions = payload.permissions.map((p: string) => String(p)) ?? []
  }
}

export interface iStatus extends iBase {
  key: string
  label: string
  description: string | null
}

export class AccountStatusDto extends BaseDto implements iStatus {
  public readonly key: string
  public readonly label: string
  public readonly description: string | null

  public constructor(payload: iStatus) {
    super(payload)

    this.key = payload.key
    this.label = payload.label
    this.description = payload.description ?? null
  }
}
