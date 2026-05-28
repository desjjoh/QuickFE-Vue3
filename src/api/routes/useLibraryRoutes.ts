import { AxiosService } from '@/helpers/request'
import {
  AccountStatusDto,
  CountryDto,
  GenderDto,
  RoleDto,
  type iCountry,
  type iGender,
  type iRole,
  type iStatus,
} from '@/models/reference'

import { instance } from '../useLocalhostAPI'

const { parseArrayResponse } = AxiosService

export interface LibraryRoutes {
  getCountries: () => Promise<CountryDto[]>
  getGenders: () => Promise<GenderDto[]>
  getRoles: () => Promise<RoleDto[]>
  getStatuses: () => Promise<AccountStatusDto[]>
}

export function useLibraryRoutes(): LibraryRoutes {
  async function getCountries(): Promise<CountryDto[]> {
    return instance.get<iCountry[]>('library/countries').then(parseArrayResponse(CountryDto))
  }

  async function getGenders(): Promise<GenderDto[]> {
    return instance.get<iGender[]>('library/genders').then(parseArrayResponse(GenderDto))
  }

  async function getRoles(): Promise<RoleDto[]> {
    return instance.get<iRole[]>('library/roles').then(parseArrayResponse(RoleDto))
  }

  async function getStatuses(): Promise<AccountStatusDto[]> {
    return instance.get<iStatus[]>('library/statuses').then(parseArrayResponse(AccountStatusDto))
  }

  return {
    getCountries,
    getGenders,
    getRoles,
    getStatuses,
  }
}
