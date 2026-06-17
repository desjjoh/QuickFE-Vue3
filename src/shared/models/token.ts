import { UserDto, type User } from './user'

export interface iCsrfToken {
  readonly token: string
  readonly iat: number
  readonly exp: number
}

export class CsrfTokenDto {
  public readonly token: string
  public readonly iat: number
  public readonly exp: number

  constructor(payload: iCsrfToken) {
    this.token = payload.token
    this.iat = payload.iat
    this.exp = payload.exp
  }
}

export interface iJwtResponse {
  readonly refresh: number

  readonly access_token: string
  readonly iat: number
  readonly exp: number

  readonly user: User
}

export class JwtResponseDto {
  public readonly refresh: number

  public readonly access_token: string
  public readonly iat: number
  public readonly exp: number

  public readonly user: UserDto

  constructor(payload: iJwtResponse) {
    this.refresh = payload.refresh

    this.access_token = payload.access_token
    this.iat = payload.iat
    this.exp = payload.exp

    this.user = new UserDto(payload.user)
  }
}
