import { usePublicRoutes } from '@/shared/api/routes/usePublicRoutes'
import type { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference'

import { defineStore, type Store, type StoreDefinition } from 'pinia'

export interface LibraryState {
  $requestId: string
  $initialized: boolean
  $countries: CountryDto[]
  $genders: GenderDto[]
  $timezones: TimezoneDto[]
}

interface LibraryGetters {
  isInitialized: (state: LibraryState) => boolean
  countries: (state: LibraryState) => CountryDto[]
  genders: (state: LibraryState) => GenderDto[]
  timezones: (state: LibraryState) => TimezoneDto[]
}

interface LibraryActions {
  load: (force?: boolean) => Promise<void>
  markInitialized: () => void
  clear: () => void
}

function createDefaultState(): LibraryState {
  return {
    $requestId: crypto.randomUUID(),
    $initialized: false,
    $countries: [],
    $genders: [],
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
    timezones: (state: LibraryState): TimezoneDto[] => state.$timezones,
  },
  actions: {
    async load(force = false): Promise<void> {
      if (this.$initialized && !force) return
      const requestId = crypto.randomUUID()

      this.$requestId = requestId
      const { countries, genders, timezones } = await usePublicRoutes().library.getStartup()

      if (requestId !== this.$requestId) return
      this.$countries = countries
      this.$genders = genders
      this.$timezones = timezones

      this.markInitialized()
    },

    markInitialized(): void {
      this.$initialized = true
    },

    clear(): void {
      this.$state = createDefaultState()
    },
  },
})

export type LibraryStore = Store<'library', LibraryState, LibraryGetters, LibraryActions>
