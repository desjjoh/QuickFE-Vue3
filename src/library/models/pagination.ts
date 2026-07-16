export interface PaginationMeta {
  readonly page: number
  readonly take: number
  readonly itemCount: number
  readonly pageCount: number
  readonly hasPreviousPage: boolean
  readonly hasNextPage: boolean
}

export interface Paginated<T> {
  readonly data: T[]
  readonly meta: PaginationMeta
}

export class PaginationMetaDto implements PaginationMeta {
  public readonly page: number
  public readonly take: number
  public readonly itemCount: number
  public readonly pageCount: number
  public readonly hasPreviousPage: boolean
  public readonly hasNextPage: boolean

  public constructor(payload: PaginationMeta) {
    this.page = Number(payload.page)
    this.take = Number(payload.take)
    this.itemCount = Number(payload.itemCount)
    this.pageCount = Number(payload.pageCount)
    this.hasPreviousPage = Boolean(payload.hasPreviousPage)
    this.hasNextPage = Boolean(payload.hasNextPage)
  }
}

export class PaginatedDto<TDto, TPayload> implements Paginated<TDto> {
  public readonly data: TDto[]
  public readonly meta: PaginationMetaDto

  public constructor(payload: Paginated<TPayload>, DtoClass: new (data: TPayload) => TDto) {
    this.data = payload.data.map((item: TPayload): TDto => new DtoClass(item))
    this.meta = new PaginationMetaDto(payload.meta)
  }
}
