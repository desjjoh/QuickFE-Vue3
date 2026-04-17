import { BaseDto, type iBase } from './base'

export interface iPermission extends iBase {
  readonly name: string
  readonly description?: string
  readonly key: string
}

export class PermissionDto extends BaseDto {
  public readonly name: string
  public readonly description?: string
  public readonly key: string

  constructor(payload: iPermission) {
    super(payload)

    this.name = payload.name
    this.description = payload.description
    this.key = payload.key
  }
}

export interface iRole extends iBase {
  readonly name: string
  readonly description?: string
  readonly permissions: iPermission[]
}

export class RoleDto extends BaseDto {
  public readonly name: string
  public readonly description?: string
  public readonly permissions: iPermission[]

  constructor(payload: iRole) {
    super(payload)

    this.name = payload.name
    this.description = payload.description
    this.permissions =
      payload.permissions?.map((value: iPermission) => new PermissionDto(value)) ?? []
  }
}

interface iName {
  readonly first: string
  readonly last: string
}

class NameDto {
  public readonly first: string
  public readonly last: string

  constructor(payload: iName) {
    this.first = payload.first
    this.last = payload.last
  }
}

interface iProfile extends iBase {
  readonly name: iName
}

class ProfileDto extends BaseDto {
  public readonly name: NameDto

  constructor(payload: iProfile) {
    super(payload)

    this.name = new NameDto(payload.name)
  }
}

export interface iUser extends iBase {
  readonly profile: iProfile
  readonly email: string
  readonly roles: iRole[]
}

export class UserDto extends BaseDto {
  public readonly profile: ProfileDto
  public readonly email: string
  public readonly roles: RoleDto[]
  public readonly raw: iUser

  public getFullName(): string {
    return [this.profile.name.first, this.profile.name.last].filter(Boolean).join(' ')
  }

  public getInitials(): string {
    return [this.profile.name.first, this.profile.name.last]
      .filter(Boolean)
      .map((value: string) => value.trim().charAt(0).toUpperCase())
      .join('')
  }

  public getRoles(): string[] {
    return Array.from(new Set(this.roles.map((role: RoleDto) => role.name)))
  }

  public getPermissions(): string[] {
    return Array.from(
      new Set(
        this.roles.flatMap((role: RoleDto) =>
          role.permissions.map((permission: PermissionDto) => permission.key),
        ),
      ),
    )
  }

  constructor(payload: iUser) {
    super(payload)

    this.profile = new ProfileDto(payload.profile)
    this.email = payload.email
    this.roles = payload.roles?.map((value: iRole) => new RoleDto(value)) ?? []
    this.raw = payload
  }
}
