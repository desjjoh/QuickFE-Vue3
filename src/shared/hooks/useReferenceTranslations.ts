import { useI18n } from 'vue-i18n'

import { getTimezoneName } from '@/helpers/time-zone'

import type {
  CountryDto,
  GenderDto,
  RegionDto,
  RoleDto,
  TimezoneDto,
  AccountStatusDto,
} from '@/library/models/reference'

function normalizeKey(value: string): string {
  return value.trim().replace(/[./]/g, '_')
}

function getTimezoneCityFromKey(timezone: TimezoneDto): string {
  const segments = timezone.key.split('/')
  return segments[segments.length - 1]?.replace(/_/g, ' ') || timezone.exemplar_city
}

function isTimezoneAbbreviation(value: string): boolean {
  return /^[A-Z]{2,5}$/.test(value)
}

function getLocalizedTimezoneCity(timezone: TimezoneDto, locale: string): string {
  const cityName = getTimezoneName(timezone.key, 'shortGeneric', locale)
  const shortOffsetName = getTimezoneName(timezone.key, 'shortOffset', locale)

  if (isTimezoneAbbreviation(cityName) || cityName === shortOffsetName) {
    return getTimezoneCityFromKey(timezone)
  }

  return cityName
    .replace(/\s+Time$/i, '')
    .replace(/^hora\s+de\s+/i, '')
    .replace(/^heure\s*:\s*/i, '')
    .trim()
}

type Reference = {
  countryLabel: (country: CountryDto) => string
  genderLabel: (gender: GenderDto) => string
  regionLabel: (region: RegionDto) => string
  roleLabel: (role: RoleDto) => string
  timezoneLabel: (timezone: TimezoneDto) => string
  statusLabel: (status: AccountStatusDto) => string
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function useReferenceTranslations(): Reference {
  const { t, te, locale } = useI18n()

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
      `library.regions.${normalizeKey(region.country)}.${normalizeKey(region.key)}`,
      region.label,
    )
  }

  function roleLabel(role: RoleDto): string {
    return translateReference(`library.roles.${normalizeKey(role.key)}`, role.label)
  }

  function statusLabel(status: AccountStatusDto): string {
    return translateReference(`library.statuses.${normalizeKey(status.key)}`, status.label)
  }

  function timezoneLabel(timezone: TimezoneDto): string {
    const activeLocale = String(locale.value)

    const offsetName = getTimezoneName(timezone.key, 'longOffset', activeLocale)
    const cityName = getLocalizedTimezoneCity(timezone, activeLocale)
    const longName = capitalizeFirstLetter(
      getTimezoneName(timezone.key, 'longGeneric', activeLocale),
    )

    return `${offsetName} — ${longName} (${cityName})`
  }

  return {
    countryLabel,
    genderLabel,
    regionLabel,
    roleLabel,
    timezoneLabel,
    statusLabel,
  }
}
