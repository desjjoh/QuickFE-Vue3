import { AxiosService } from '@/helpers/request'
import { PaginatedDto, type Paginated } from '@/library/models/pagination'
import { UserDto, type User } from '@/library/models/user'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

export type AdministrationUserSort =
  | 'user.createdAt'
  | 'profile.name.last'
  | 'user.identity.email'
  | 'fullname'

export type AdministrationSortOrder = 'ASC' | 'DESC'

export interface AdministrationUsersQuery {
  search?: string
  order?: AdministrationSortOrder
  page?: number
  take?: number
  sort?: AdministrationUserSort
}

export interface AdministrationUserRoutes {
  getUsers: (
    token: string,
    query?: AdministrationUsersQuery,
  ) => Promise<PaginatedDto<UserDto, User>>
  getUser: (token: string, id: string) => Promise<UserDto>
  deleteUser: (token: string, id: string) => Promise<void>
}

export interface AdministrationRoutes {
  users: AdministrationUserRoutes
}

export function useAdministrationRoutes(): AdministrationRoutes {
  const users: AdministrationUserRoutes = useAdministrationUserRoutes()

  return {
    users,
  }
}

export function useAdministrationUserRoutes(): AdministrationUserRoutes {
  async function getUsers(
    token: string,
    query: AdministrationUsersQuery = {},
  ): Promise<PaginatedDto<UserDto, User>> {
    return instance
      .get<Paginated<User>>('administration/users', requestConfig({ token, params: { ...query } }))
      .then(
        ({ data }: { data: Paginated<User> }): PaginatedDto<UserDto, User> =>
          new PaginatedDto(data, UserDto),
      )
  }

  async function getUser(token: string, id: string): Promise<UserDto> {
    return instance
      .get<User>(`administration/users/${id}`, requestConfig({ token }))
      .then(parseResponse(UserDto))
  }

  async function deleteUser(token: string, id: string): Promise<void> {
    await instance.delete<void>(`administration/users/${id}`, requestConfig({ token }))
  }

  return {
    getUsers,
    getUser,
    deleteUser,
  }
}
