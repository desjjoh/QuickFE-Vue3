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

export interface User extends iBase {
  identity: {
    email: string
  }

  profile: {
    name: {
      first: string
      last: string
      preferred: string | null
    }

    personal: {
      bio: string | null
      dob: string
      gender: string
    }

    contact: {
      phone: Phone | null
      address: Address | null
    }

    region: {
      country: iCountry
      timezone: iTimezone
    }

    avatar: Image | null
  }

  metadata: {
    lastSignIn: string | null
    lastChangedEmail: string | null
    lastChangedPassword: string | null
  }

  roles: Role[]
  status: string
}

export class UpdateUserPhoneDto implements Phone {
  public readonly phone_country_id: string
  public readonly phone_calling_code: string
  public readonly phone_national_number: string
  public readonly phone_e164: string

  constructor(phone: PhoneInputValue) {
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

  constructor(payload: Phone) {
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

  constructor(payload: Address) {
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

  constructor(payload: Image) {
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

  constructor(payload: Role) {
    this.key = payload.key
    this.label = payload.label
    this.description = payload.description ?? null
    this.permissions = payload.permissions ?? []
  }
}

export class UserDto extends BaseDto implements User {
  public readonly identity: User['identity']
  public readonly profile: User['profile']
  public readonly metadata: User['metadata']
  public readonly roles: RoleDto[]
  public readonly status: string

  getFullName(): string {
    const { first, last } = this.profile.name
    return [first, last].filter(Boolean).join(' ')
  }

  getInitials(): string {
    const { first, last } = this.profile.name

    return [first, last]
      .filter(Boolean)
      .map((v) => v.charAt(0).toUpperCase())
      .join('')
  }

  getPermissions(): string[] {
    return Array.from(new Set(this.roles.flatMap((r) => r.permissions)))
  }

  constructor(payload: User) {
    super(payload)

    this.identity = {
      email: payload.identity.email,
    }

    this.profile = {
      name: {
        first: payload.profile.name.first,
        last: payload.profile.name.last,
        preferred: payload.profile.name.preferred,
      },

      personal: {
        bio: payload.profile.personal.bio,
        dob: payload.profile.personal.dob,
        gender: payload.profile.personal.gender,
      },

      contact: {
        phone: payload.profile.contact.phone ? new PhoneDto(payload.profile.contact.phone) : null,
        address: payload.profile.contact.address
          ? new AddressDto(payload.profile.contact.address)
          : null,
      },

      region: {
        country: new CountryDto(payload.profile.region.country),
        timezone: new TimezoneDto(payload.profile.region.timezone),
      },

      avatar: payload.profile.avatar ? new ImageDto(payload.profile.avatar) : null,
    }

    this.metadata = {
      lastSignIn: payload.metadata.lastSignIn,
      lastChangedEmail: payload.metadata.lastChangedEmail,
      lastChangedPassword: payload.metadata.lastChangedPassword,
    }

    this.roles = payload.roles.map((r: Role) => new RoleDto(r))
    this.status = payload.status
  }
}
