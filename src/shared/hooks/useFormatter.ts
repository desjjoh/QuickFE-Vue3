import type { CountryDto } from '@/library/models/reference'
import type { AddressDto, PhoneDto } from '@/library/models/user'
import { useLibraryStore, type LibraryStore } from '@/stores/library'
import { formatPostalCode } from '@/helpers/reference.ts'

type UsePhoneFormatter = {
  formatPhoneNumber: (phone: PhoneDto | null | undefined) => string
  formatAddressLineOne: (address: AddressDto | null) => string
  formatAddressLineTwo: (address: AddressDto | null) => string
}

export function useFormatter(): UsePhoneFormatter {
  const libraryStore: LibraryStore = useLibraryStore()

  function formatPhoneNumber(phone: PhoneDto | null | undefined): string {
    if (!phone) return ''

    const country: CountryDto | undefined = findCountryById(phone.phone_country_id)
    const nationalNumber: string = formatGroupedValue(
      phone.phone_national_number,
      country?.phone_format_groups,
    )

    return [phone.phone_calling_code, nationalNumber].filter(Boolean).join(' ')
  }

  function formatGroupedValue(value: string, groups: number[] | undefined): string {
    const normalized: string = value.replace(/\D/g, '')

    if (!groups?.length) return normalized

    const parts: string[] = []
    let cursor = 0

    for (const groupSize of groups) {
      const part: string = normalized.slice(cursor, cursor + groupSize)

      if (!part) break

      parts.push(part)
      cursor += groupSize
    }

    const remaining: string = normalized.slice(cursor)

    if (remaining) parts.push(remaining)

    return parts.join(' ')
  }

  function findCountryById(countryId: string): CountryDto | undefined {
    return libraryStore.countries.find((country: CountryDto): boolean => {
      return country.id === countryId
    })
  }

  function formatAddressLineOne(address: AddressDto | null): string {
    if (!address) return ''

    return [address.address_line_1, address.address_line_2].filter(Boolean).join(', ')
  }

  function formatAddressLineTwo(address: AddressDto | null): string {
    if (!address) return ''

    const country = findCountryByCode(address.country)
    const postalCode = formatPostalCode(address.postal_code, country)

    return [address.city, address.region.code, postalCode].filter(Boolean).join(' ')
  }

  function findCountryByCode(countryCode: string): CountryDto | undefined {
    return libraryStore.countries.find((country) => {
      return [country.id, country.key, country.iso2, country.iso3].includes(countryCode)
    })
  }

  return {
    formatPhoneNumber,
    formatAddressLineOne,
    formatAddressLineTwo,
  }
}
