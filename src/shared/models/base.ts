export interface iBase {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export class BaseDto {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor({ id, createdAt, updatedAt }: iBase) {
    this.id = id
    this.createdAt = new Date(createdAt)
    this.updatedAt = new Date(updatedAt)
  }
}
