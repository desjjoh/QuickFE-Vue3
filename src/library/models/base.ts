export interface iBase {
  readonly id: string
  readonly createdAt: string
  readonly updatedAt: string
}

export class BaseDto {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  public constructor({ id, createdAt, updatedAt }: iBase) {
    this.id = id
    this.createdAt = new Date(createdAt)
    this.updatedAt = new Date(updatedAt)
  }
}
