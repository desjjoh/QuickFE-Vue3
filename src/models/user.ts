import { BaseDto, type iBase } from './base'

export interface Image {
  url: string
  alt_text: string | null
  width: number
  height: number
  size_bytes: number
  mime_type: string
  storage_key: string
}

export interface Role {
  key: string
  label: string
  description?: string
  permissions: string[]
}

export interface User extends iBase {
  identity: {
    email: string
    phone_e164: string | null
  }

  profile: {
    name: {
      first: string
      last: string
      preferred: string | null
    }

    personal: {
      dob: string
      gender: string
    }

    contact: {
      alternate_phone_e164: string | null
      address: {
        address_line_1: string
        address_line_2: string | null
        city: string
        region: string
        postal_code: string
        country: string
      } | null
    }

    avatar: Image | null
  }

  roles: Role[]
  status: string
}

export interface Address {
  address_line_1: string
  address_line_2: string | null
  city: string
  region: string
  postal_code: string
  country: string
}

export class AddressDto implements Address {
  public readonly address_line_1: string
  public readonly address_line_2: string | null
  public readonly city: string
  public readonly region: string
  public readonly postal_code: string
  public readonly country: string

  constructor(payload: Address) {
    this.address_line_1 = payload.address_line_1
    this.address_line_2 = payload.address_line_2
    this.city = payload.city
    this.region = payload.region
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

  constructor(payload: Image) {
    this.url = payload.url
    this.alt_text = payload.alt_text
    this.width = payload.width
    this.height = payload.height
    this.size_bytes = payload.size_bytes
    this.mime_type = payload.mime_type
    this.storage_key = payload.storage_key
  }
}

export class RoleDto implements Role {
  public readonly key: string
  public readonly label: string
  public readonly description?: string
  public readonly permissions: string[]

  constructor(payload: Role) {
    this.key = payload.key
    this.label = payload.label
    this.description = payload.description
    this.permissions = payload.permissions ?? []
  }
}

export class UserDto extends BaseDto implements User {
  public readonly identity: User['identity']
  public readonly profile: User['profile']
  public readonly roles: Role[]
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
      phone_e164: payload.identity.phone_e164,
    }

    this.profile = {
      name: {
        first: payload.profile.name.first,
        last: payload.profile.name.last,
        preferred: payload.profile.name.preferred,
      },

      personal: {
        dob: payload.profile.personal.dob,
        gender: payload.profile.personal.gender,
      },

      contact: {
        alternate_phone_e164: payload.profile.contact.alternate_phone_e164,
        address: payload.profile.contact.address
          ? new AddressDto(payload.profile.contact.address)
          : null,
      },

      avatar: payload.profile.avatar ? new ImageDto(payload.profile.avatar) : null,
    }

    this.roles = payload.roles.map(
      (r: Role) =>
        new RoleDto({
          key: r.key,
          label: r.label,
          description: r.description,
          permissions: r.permissions,
        }),
    )

    this.status = payload.status
  }
}
