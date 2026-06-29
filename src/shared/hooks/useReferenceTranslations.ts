import { useI18n } from 'vue-i18n'

import type {
  CountryDto,
  GenderDto,
  RegionDto,
  RoleDto,
  TimezoneDto,
} from '@/library/models/reference'

function normalizeKey(value: string): string {
  return value.trim().replace(/\./g, '_')
}

export function useReferenceTranslations() {
  const { t, te } = useI18n()

  function translateReference(key: string, fallback: string): string {
    return te(key) ? t(key) : fallback
  }

  function countryLabel(country: CountryDto): string {
    return translateReference(`library.countries.${normalizeKey(country.iso2)}`, country.label)
  }

  function genderLabel(gender: GenderDto): string {
    return translateReference(`library.genders.${normalizeKey(gender.key)}`, gender.label)
  }

  function regionLabel(region: RegionDto): string {
    return translateReference(
      `library.regions.${normalizeKey(region.country)}.${normalizeKey(region.code)}`,
      region.label,
    )
  }

  function roleLabel(role: RoleDto): string {
    return translateReference(`library.roles.${normalizeKey(role.key)}`, role.label)
  }

  function timezoneLabel(timezone: TimezoneDto): string {
    return `UTC${timezone.offset_label} — ${timezone.exemplar_city}`
  }

  return {
    countryLabel,
    genderLabel,
    regionLabel,
    roleLabel,
    timezoneLabel,
  }
}
