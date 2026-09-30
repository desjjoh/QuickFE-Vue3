export function formatPhoneDigitGroups(
  value: string,
  groups: readonly number[] | undefined,
  separator = ' ',
): string {
  const digits = value.replace(/\D/g, '')

  if (!groups?.length) return digits

  const parts: string[] = []
  let cursor = 0

  for (const groupSize of groups) {
    const part = digits.slice(cursor, cursor + groupSize)

    if (!part) break

    parts.push(part)
    cursor += groupSize
  }

  const remaining = digits.slice(cursor)

  if (remaining) parts.push(remaining)

  return parts.join(separator)
}
