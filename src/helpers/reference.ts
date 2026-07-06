import type { CountryDto } from '@/library/models/reference'

export function formatPostalCode(postalCode: string, country: CountryDto | undefined): string {
  const normalized = postalCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  if (!country?.postal_code_format_groups.length) return normalized

  const maxLength = country.postal_code_format_groups.reduce((total, group) => total + group, 0)
  const trimmed = normalized.slice(0, maxLength)
  const groups: string[] = []
  let cursor = 0

  for (const groupSize of country.postal_code_format_groups) {
    const group = trimmed.slice(cursor, cursor + groupSize)

    if (!group) break

    groups.push(group)
    cursor += groupSize
  }

  return groups.join(country.postal_code_format_separator)
}
