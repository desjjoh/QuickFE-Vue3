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

export interface iUser extends iBase {
  readonly email: string
  readonly roles: iRole[]
}

export class UserDto extends BaseDto {
  public readonly email: string
  public readonly roles: RoleDto[]
  public readonly raw: iUser

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

    this.email = payload.email
    this.roles = payload.roles?.map((value: iRole) => new RoleDto(value)) ?? []
    this.raw = payload
  }
}
