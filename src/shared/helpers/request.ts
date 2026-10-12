import type { AxiosRequestConfig, AxiosResponse } from 'axios'

/** Reuse a key only when retrying the same operation with the same payload. */
export interface IdempotencyOptions {
  idempotencyKey?: string
}

interface RequestConfig extends IdempotencyOptions {
  contentType?: string
  token?: string | null
  params?: Record<string, unknown>
  data?: Record<string, unknown>
  withCredentials?: boolean
  csrfToken?: string
  preserveSessionOnUnauthorized?: boolean
}

class AxiosService {
  public static parseResponse = <T, TPayload>(DtoClass: new (data: TPayload) => T) => {
    return (response: AxiosResponse<TPayload>): T => new DtoClass(response.data)
  }

  public static parseArrayResponse = <T, TPayload>(DtoClass: new (data: TPayload) => T) => {
    return (response: AxiosResponse<TPayload[]>): T[] =>
      response.data.map((item: TPayload) => new DtoClass(item))
  }

  public static requestConfig = ({
    token,
    params,
    contentType,
    data,
    withCredentials = false,
    csrfToken,
    idempotencyKey,
    preserveSessionOnUnauthorized = false,
  }: RequestConfig): AxiosRequestConfig => {
    const headers: Record<string, string> = {}

    if (token) headers['Authorization'] = `Bearer ${token}`
    if (contentType) headers['Content-Type'] = contentType
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken
    if (idempotencyKey !== undefined) {
      if (!/^[\x21-\x7e]{1,128}$/.test(idempotencyKey) || idempotencyKey.includes(',')) {
        throw new Error(
          'Idempotency-Key must be one non-whitespace ASCII value of at most 128 characters.',
        )
      }
      headers['Idempotency-Key'] = idempotencyKey
    }

    return {
      ...(params && {
        params,
        paramsSerializer: {
          indexes: null,
        },
      }),
      ...(withCredentials && { withCredentials }),
      ...(Object.keys(headers).length && { headers }),
      ...(data && { data }),
      ...(preserveSessionOnUnauthorized && { __quickfePreserveSessionOnUnauthorized: true }),
    }
  }

  /** Use only for endpoints decorated with @Idempotent in QuickAPI. */
  public static idempotentRequestConfig = (options: RequestConfig): AxiosRequestConfig =>
    AxiosService.requestConfig({
      ...options,
      idempotencyKey: options.idempotencyKey ?? crypto.randomUUID(),
    })
}

export { AxiosService }
