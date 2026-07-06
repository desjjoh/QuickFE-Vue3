export function emptyStringToNull(value: unknown, originalValue: unknown): string | null {
  if (typeof originalValue !== 'string') return value === null ? null : String(value)

  const normalizedValue: string = originalValue.trim()

  if (!normalizedValue) return null

  return normalizedValue
}
