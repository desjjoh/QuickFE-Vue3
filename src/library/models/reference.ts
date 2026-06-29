import { formatOffsetLabel, getTimezoneOffsetMinutes } from '@/helpers/time-zone'
import { BaseDto, type iBase } from './base'

export interface iRegion extends iBase {
  key: string
  code: string
  label: string
  country: string
}

export class RegionDto extends BaseDto implements iRegion {
  public readonly key: string
  public readonly code: string
  public readonly label: string
  public readonly country: string

  public constructor(payload: iRegion) {
    super(payload)

    this.key = payload.key
    this.code = payload.code
    this.label = payload.label
    this.country = payload.country
  }
}

export interface iCountry extends iBase {
  key: string
  label: string
  iso2: string
  iso3: string
  calling_code: string
  flag_url: string

  phone_national_placeholder: string
  phone_national_pattern: string
  phone_format_groups: number[]

  postal_code_placeholder: string
  postal_code_pattern: string
  postal_code_format_groups: number[]
  postal_code_format_separator: string

  regions: iRegion[]
}

export class CountryDto extends BaseDto implements iCountry {
  public readonly key: string
  public readonly label: string
  public readonly iso2: string
  public readonly iso3: string
  public readonly calling_code: string
  public readonly flag_url: string

  public readonly regions: RegionDto[]

  public readonly phone_national_placeholder: string
  public readonly phone_national_pattern: string
  public readonly phone_format_groups: number[]

  public readonly postal_code_placeholder: string
  public readonly postal_code_pattern: string
  public readonly postal_code_format_groups: number[]
  public readonly postal_code_format_separator: string

  public constructor(payload: iCountry) {
    super(payload)

    this.key = payload.key
    this.label = payload.label
    this.iso2 = payload.iso2
    this.iso3 = payload.iso3
    this.flag_url = payload.flag_url

    this.calling_code = payload.calling_code

    this.phone_national_placeholder = payload.phone_national_placeholder
    this.phone_national_pattern = payload.phone_national_pattern
    this.phone_format_groups = payload.phone_format_groups

    this.postal_code_placeholder = payload.postal_code_placeholder
    this.postal_code_pattern = payload.postal_code_pattern
    this.postal_code_format_groups = payload.postal_code_format_groups
    this.postal_code_format_separator = payload.postal_code_format_separator

    this.regions = payload.regions.map((region: iRegion) => new RegionDto(region))
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

export interface iTimezone extends iBase {
  key: string
  label: string
  long_name: string
  region: string
  exemplar_city: string
}

export class TimezoneDto extends BaseDto implements iTimezone {
  public readonly key: string
  public readonly label: string
  public readonly long_name: string
  public readonly offset_minutes: number
  public readonly offset_label: string
  public readonly region: string
  public readonly exemplar_city: string

  public constructor(payload: iTimezone) {
    super(payload)

    const offsetMinutes = getTimezoneOffsetMinutes(payload.key)

    this.key = payload.key
    this.label = payload.label
    this.long_name = payload.long_name
    this.offset_minutes = offsetMinutes
    this.offset_label = formatOffsetLabel(offsetMinutes)
    this.region = payload.region
    this.exemplar_city = payload.exemplar_city
  }
}
