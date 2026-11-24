import { AxiosService } from '@/shared/helpers/request'
import { LibraryStartupDto, type iLibraryStartup } from '@/library/models/reference'

import { instance } from '../useLocalhostAPI'

const { parseResponse } = AxiosService

export interface PublicLibraryRoutes {
  getStartup: () => Promise<LibraryStartupDto>
}

export interface PublicRoutes {
  library: PublicLibraryRoutes
}

export function usePublicRoutes(): PublicRoutes {
  return { library: usePublicLibraryRoutes() }
}

export function usePublicLibraryRoutes(): PublicLibraryRoutes {
  async function getStartup(): Promise<LibraryStartupDto> {
    return instance
      .get<iLibraryStartup>('public/library/startup')
      .then(parseResponse(LibraryStartupDto))
  }

  return { getStartup }
}
