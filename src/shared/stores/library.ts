import { useLibraryRoutes } from '@/api/routes/useLibraryRoutes'
import type {
  CountryDto,
  GenderDto,
  AccountStatusDto,
  RoleDto,
  TimezoneDto,
} from '@/library/models/reference'

import { defineStore, type Store, type StoreDefinition } from 'pinia'

export interface LibraryState {
  $initialized: boolean
  $countries: CountryDto[]
  $genders: GenderDto[]
  $roles: RoleDto[]
  $statuses: AccountStatusDto[]
  $timezones: TimezoneDto[]
}

interface LibraryGetters {
  isInitialized: (state: LibraryState) => boolean
  countries: (state: LibraryState) => CountryDto[]
  genders: (state: LibraryState) => GenderDto[]
  roles: (state: LibraryState) => RoleDto[]
  statuses: (state: LibraryState) => AccountStatusDto[]
  timezones: (state: LibraryState) => TimezoneDto[]
}

interface LibraryActions {
  hydrateLibrary: () => Promise<void>
  markInitialized: () => void
  reset: () => void
}

function createDefaultState(): LibraryState {
  return {
    $initialized: false,
    $countries: [],
    $genders: [],
    $roles: [],
    $statuses: [],
    $timezones: [],
  }
}

type StoreDef = StoreDefinition<'library', LibraryState, LibraryGetters, LibraryActions>

export const useLibraryStore: StoreDef = defineStore('library', {
  state: (): LibraryState => createDefaultState(),
  getters: {
    isInitialized: (state: LibraryState): boolean => state.$initialized,
    countries: (state: LibraryState): CountryDto[] => state.$countries,
    genders: (state: LibraryState): GenderDto[] => state.$genders,
    roles: (state: LibraryState): RoleDto[] => state.$roles,
    statuses: (state: LibraryState): AccountStatusDto[] => state.$statuses,
    timezones: (state: LibraryState): TimezoneDto[] => state.$timezones,
  },
  actions: {
    async hydrateLibrary(): Promise<void> {
      const libraryRoutes = useLibraryRoutes()

      const [countries, genders, roles, statuses, timezones] = await Promise.all([
        libraryRoutes.getCountries(),
        libraryRoutes.getGenders(),
        libraryRoutes.getRoles(),
        libraryRoutes.getStatuses(),
        libraryRoutes.getTimezones(),
      ])

      this.$countries = countries
      this.$genders = genders
      this.$roles = roles
      this.$statuses = statuses
      this.$timezones = timezones

      this.markInitialized()
    },

    markInitialized(): void {
      this.$initialized = true
    },

    reset(): void {
      this.$state = createDefaultState()
    },
  },
})

export type LibraryStore = Store<'library', LibraryState, LibraryGetters, LibraryActions>
