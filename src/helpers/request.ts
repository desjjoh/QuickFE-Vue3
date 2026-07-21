import type { AxiosRequestConfig, AxiosResponse } from 'axios'

interface RequestConfig {
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
    preserveSessionOnUnauthorized = false,
  }: RequestConfig): AxiosRequestConfig => {
    const headers: Record<string, string> = {}

    if (token) headers['Authorization'] = `Bearer ${token}`
    if (contentType) headers['Content-Type'] = contentType
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken

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
}

export { AxiosService }
