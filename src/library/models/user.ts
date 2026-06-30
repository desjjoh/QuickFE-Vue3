import type { PhoneInputValue } from '@/shared/components/inputs/PhoneInput.vue'

import { BaseDto, type iBase } from './base'
import {
  CountryDto,
  RegionDto,
  TimezoneDto,
  type iCountry,
  type iRegion,
  type iTimezone,
} from './reference'

export interface Image {
  url: string
  alt_text: string | null
  width: number
  height: number
  size_bytes: number
  mime_type: string
  storage_key: string
  filename: string
}

export interface Role {
  key: string
  label: string
  description: string | null
  permissions: string[]
}

export interface Phone {
  phone_country_id: string
  phone_calling_code: string
  phone_national_number: string
  phone_e164: string
}

export interface Address {
  address_line_1: string
  address_line_2: string | null
  city: string
  region: iRegion
  postal_code: string
  country: string
}

export interface UserIdentity {
  email: string
}

export interface UserName {
  first: string
  last: string
  preferred: string | null
}

export interface UserPersonal {
  bio: string | null
  dob: string
  gender: string
}

export interface UserContact {
  phone: Phone | null
  address: Address | null
}

export interface UserRegion {
  country: iCountry
  timezone: iTimezone
}

export interface UserProfile {
  name: UserName
  personal: UserPersonal
  contact: UserContact
  region: UserRegion
  avatar: Image | null
}

export interface UserMetadata {
  lastSignIn: Date | null
  lastChangedEmail: Date | null
  lastChangedPassword: Date | null
}

export interface User extends iBase {
  identity: UserIdentity
  profile: UserProfile
  metadata: UserMetadata
  roles: Role[]
  status: string
}

export class UpdateUserPhoneDto implements Phone {
  public readonly phone_country_id: string
  public readonly phone_calling_code: string
  public readonly phone_national_number: string
  public readonly phone_e164: string

  public constructor(phone: PhoneInputValue) {
    this.phone_country_id = phone.phone_country_id
    this.phone_calling_code = phone.phone_calling_code
    this.phone_national_number = phone.phone_national_number
    this.phone_e164 = phone.phone_e164
  }
}

export class PhoneDto implements Phone {
  public readonly phone_country_id: string
  public readonly phone_calling_code: string
  public readonly phone_national_number: string
  public readonly phone_e164: string

  public constructor(payload: Phone) {
    this.phone_country_id = payload.phone_country_id
    this.phone_calling_code = payload.phone_calling_code
    this.phone_national_number = payload.phone_national_number
    this.phone_e164 = payload.phone_e164
  }
}

export class AddressDto implements Address {
  public readonly address_line_1: string
  public readonly address_line_2: string | null
  public readonly city: string
  public readonly region: RegionDto
  public readonly postal_code: string
  public readonly country: string

  public constructor(payload: Address) {
    this.address_line_1 = payload.address_line_1
    this.address_line_2 = payload.address_line_2
    this.city = payload.city
    this.region = new RegionDto(payload.region)
    this.postal_code = payload.postal_code
    this.country = payload.country
  }
}

export class ImageDto implements Image {
  public readonly url: string
  public readonly alt_text: string | null
  public readonly width: number
  public readonly height: number
  public readonly size_bytes: number
  public readonly mime_type: string
  public readonly storage_key: string
  public readonly filename: string

  public constructor(payload: Image) {
    this.url = payload.url
    this.alt_text = payload.alt_text
    this.width = payload.width
    this.height = payload.height
    this.size_bytes = payload.size_bytes
    this.mime_type = payload.mime_type
    this.storage_key = payload.storage_key
    this.filename = payload.filename
  }
}

export class RoleDto implements Role {
  public readonly key: string
  public readonly label: string
  public readonly description: string | null
  public readonly permissions: string[]

  public constructor(payload: Role) {
    this.key = payload.key
    this.label = payload.label
    this.description = payload.description ?? null
    this.permissions = payload.permissions ?? []
  }
}

export class UserIdentityDto implements UserIdentity {
  public readonly email: string

  public constructor(payload: UserIdentity) {
    this.email = payload.email
  }
}

export class UserNameDto implements UserName {
  public readonly first: string
  public readonly last: string
  public readonly preferred: string | null

  public constructor(payload: UserName) {
    this.first = payload.first
    this.last = payload.last
    this.preferred = payload.preferred
  }
}

export class UserPersonalDto implements UserPersonal {
  public readonly bio: string | null
  public readonly dob: string
  public readonly gender: string

  public constructor(payload: UserPersonal) {
    this.bio = payload.bio
    this.dob = payload.dob
    this.gender = payload.gender
  }
}

export class UserContactDto {
  public readonly phone: PhoneDto | null
  public readonly address: AddressDto | null

  public constructor(payload: UserContact) {
    this.phone = payload.phone ? new PhoneDto(payload.phone) : null
    this.address = payload.address ? new AddressDto(payload.address) : null
  }
}

export class UserRegionDto {
  public readonly country: CountryDto
  public readonly timezone: TimezoneDto

  public constructor(payload: UserRegion) {
    this.country = new CountryDto(payload.country)
    this.timezone = new TimezoneDto(payload.timezone)
  }
}

export class UserProfileDto {
  public readonly name: UserNameDto
  public readonly personal: UserPersonalDto
  public readonly contact: UserContactDto
  public readonly region: UserRegionDto
  public readonly avatar: ImageDto | null

  public constructor(payload: UserProfile) {
    this.name = new UserNameDto(payload.name)
    this.personal = new UserPersonalDto(payload.personal)
    this.contact = new UserContactDto(payload.contact)
    this.region = new UserRegionDto(payload.region)
    this.avatar = payload.avatar ? new ImageDto(payload.avatar) : null
  }
}

export class UserMetadataDto implements UserMetadata {
  public readonly lastSignIn: Date | null
  public readonly lastChangedEmail: Date | null
  public readonly lastChangedPassword: Date | null

  public constructor(payload: UserMetadata) {
    this.lastSignIn = payload.lastSignIn ? new Date(payload.lastSignIn) : null
    this.lastChangedEmail = payload.lastChangedEmail ? new Date(payload.lastChangedEmail) : null
    this.lastChangedPassword = payload.lastChangedPassword
      ? new Date(payload.lastChangedPassword)
      : null
  }
}

export class UserDto extends BaseDto implements User {
  public readonly identity: UserIdentityDto
  public readonly profile: UserProfileDto
  public readonly metadata: UserMetadataDto
  public readonly roles: RoleDto[]
  public readonly status: string

  public constructor(payload: User) {
    super(payload)

    this.identity = new UserIdentityDto(payload.identity)
    this.profile = new UserProfileDto(payload.profile)
    this.metadata = new UserMetadataDto(payload.metadata)
    this.roles = payload.roles.map((role: Role): RoleDto => new RoleDto(role))
    this.status = payload.status
  }

  public getFullName(): string {
    const { first, last } = this.profile.name

    return [first, last].filter(Boolean).join(' ')
  }

  public getInitials(): string {
    const { first, last } = this.profile.name

    return [first, last]
      .filter(Boolean)
      .map((value: string): string => value.charAt(0).toUpperCase())
      .join('')
  }

  public getPermissions(): string[] {
    return Array.from(new Set(this.roles.flatMap((role: RoleDto): string[] => role.permissions)))
  }
}
