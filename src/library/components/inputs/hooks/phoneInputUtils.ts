import type { CountryDto } from '@/library/models/reference'

export type PhoneInputValue = {
  phone_country_id: string
  phone_calling_code: string
  phone_national_number: string
  phone_e164: string
}

export function extractPhoneDigits(value: string | undefined | null): string {
  return value?.replace(/\D/g, '') ?? ''
}

export function getCountryKey(country: CountryDto): string {
  return country.id
}

export function getCallingCode(country: CountryDto): string {
  const callingCode = country.calling_code.trim()
  if (!callingCode) return ''
  return callingCode.startsWith('+') ? callingCode : `+${callingCode}`
}

export function getCallingCodeDigits(country: CountryDto): string {
  return extractPhoneDigits(getCallingCode(country))
}

export function getMaxNationalDigits(country: CountryDto): number {
  const formatMaximum = country.phone_format_groups.reduce((total, size) => total + size, 0)
  return Math.min(formatMaximum, Math.max(0, 15 - getCallingCodeDigits(country).length))
}

export function countryMatchesDefault(country: CountryDto, defaultCountry: string): boolean {
  const normalizedDefault = defaultCountry.trim().toLowerCase()
  return [country.id, country.key, country.iso2, country.iso3]
    .filter(Boolean)
    .some((value) => value.toLowerCase() === normalizedDefault)
}

export function findCountryByE164(
  countries: readonly CountryDto[],
  e164Value: string | undefined,
  defaultCountry?: string,
): CountryDto | undefined {
  if (!e164Value) return undefined
  const digits = extractPhoneDigits(e164Value)
  const matches = countries
    .filter((country) => digits.startsWith(getCallingCodeDigits(country)))
    .sort((a, b) => getCallingCodeDigits(b).length - getCallingCodeDigits(a).length)
  return (
    matches.find((country) => defaultCountry && countryMatchesDefault(country, defaultCountry)) ??
    matches[0]
  )
}

export function resolveCountry(
  countries: readonly CountryDto[],
  phoneValue: PhoneInputValue | undefined,
  defaultCountry?: string,
): CountryDto | undefined {
  return (
    countries.find((country) => country.id === phoneValue?.phone_country_id) ??
    findCountryByE164(countries, phoneValue?.phone_e164, defaultCountry) ??
    countries.find((country) => defaultCountry && countryMatchesDefault(country, defaultCountry)) ??
    countries[0]
  )
}

export function parseNationalNumber(
  phoneValue: PhoneInputValue | undefined,
  country: CountryDto | undefined,
): string {
  if (!phoneValue) return ''
  if (!country) return extractPhoneDigits(phoneValue.phone_national_number).slice(0, 15)
  const maximum = getMaxNationalDigits(country)
  if (phoneValue.phone_national_number)
    return extractPhoneDigits(phoneValue.phone_national_number).slice(0, maximum)
  const e164 = extractPhoneDigits(phoneValue.phone_e164)
  const code = getCallingCodeDigits(country)
  return e164.startsWith(code)
    ? e164.slice(code.length, code.length + maximum)
    : e164.slice(0, maximum)
}

export function buildPhoneValue(
  country: CountryDto | undefined,
  rawNationalNumber: string,
): PhoneInputValue | undefined {
  if (!country) return undefined
  const callingCode = getCallingCode(country)
  const national = extractPhoneDigits(rawNationalNumber).slice(0, getMaxNationalDigits(country))
  if (!national) return undefined
  return {
    phone_country_id: country.id,
    phone_calling_code: callingCode,
    phone_national_number: national,
    phone_e164: `${callingCode}${national}`,
  }
}

export function phoneValuesEqual(a?: PhoneInputValue, b?: PhoneInputValue): boolean {
  if (!a || !b) return a === b
  return Object.keys(a).every(
    (key) => a[key as keyof PhoneInputValue] === b[key as keyof PhoneInputValue],
  )
}
