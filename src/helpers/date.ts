export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(value)

  if (!match) return false

  const [, yearText, monthText, dayText] = match

  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  const date = new Date(year, month - 1, day)

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export const formatIsoDate = (value: string, locale = 'en-US'): string => {
  const parts: string[] = value.split('-')

  if (parts.length !== 3) return value

  const [yearValue, monthValue, dayValue] = parts

  if (!yearValue || !monthValue || !dayValue) return value

  const year: number = Number(yearValue)
  const month: number = Number(monthValue)
  const day: number = Number(dayValue)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return value

  const date: Date = new Date(Date.UTC(year, month - 1, day))

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function getAgeFromIsoDate(value: string, today: Date = new Date()): number | null {
  if (!isValidIsoDate(value)) return null

  const [yearText, monthText, dayText]: string[] = value.split('-')

  if (!yearText || !monthText || !dayText) return null

  const birthYear: number = Number(yearText)
  const birthMonth: number = Number(monthText)
  const birthDay: number = Number(dayText)

  const currentYear: number = today.getFullYear()
  const currentMonth: number = today.getMonth() + 1
  const currentDay: number = today.getDate()

  let age: number = currentYear - birthYear

  const birthdayHasPassed: boolean =
    currentMonth > birthMonth || (currentMonth === birthMonth && currentDay >= birthDay)

  if (!birthdayHasPassed) age -= 1

  if (age < 0) return null

  return age
}

export type DateTimeInput = Date | null | undefined
export type LocalizedDateTimeFormat = 'long' | 'short' | 'compact'

const LOCALIZED_DATE_TIME_FORMATS: Record<LocalizedDateTimeFormat, Intl.DateTimeFormatOptions> = {
  long: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },

  short: {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },

  compact: {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  },
}

function isValidDate(value: DateTimeInput): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

export function formatLocalizedDateTime(
  value: DateTimeInput,
  locale: string,
  format: LocalizedDateTimeFormat = 'short',
): string {
  if (!isValidDate(value)) return ''

  return new Intl.DateTimeFormat(locale, LOCALIZED_DATE_TIME_FORMATS[format]).format(value)
}
