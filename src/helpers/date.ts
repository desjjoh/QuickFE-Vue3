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

export type DateTimeInput = Date | null | undefined

function isValidDate(value: DateTimeInput): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

function getEnglishOrdinalSuffix(day: number): string {
  const remainderByHundred = day % 100

  if (remainderByHundred >= 11 && remainderByHundred <= 13) {
    return 'th'
  }

  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

function formatOrdinalDay(day: number, locale: string): string {
  const normalizedLocale = locale.toLowerCase()
  const formattedDay = new Intl.NumberFormat(locale, {
    useGrouping: false,
  }).format(day)

  if (normalizedLocale.startsWith('fr')) {
    return day === 1 ? `${formattedDay}er` : `${formattedDay}e`
  }

  if (normalizedLocale.startsWith('es')) {
    return formattedDay
  }

  return `${formattedDay}${getEnglishOrdinalSuffix(day)}`
}

function getDateTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPart['type'],
): string {
  return parts.find((part: Intl.DateTimeFormatPart): boolean => part.type === type)?.value ?? ''
}

export function formatLongDateTime(value: DateTimeInput, locale: string): string {
  if (!isValidDate(value)) {
    return ''
  }

  const month = new Intl.DateTimeFormat(locale, {
    month: 'long',
  }).format(value)

  const year = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
  }).format(value)

  const day = formatOrdinalDay(value.getDate(), locale)

  const timeParts = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(value)

  const hour = getDateTimePart(timeParts, 'hour')
  const minute = getDateTimePart(timeParts, 'minute')
  const second = getDateTimePart(timeParts, 'second')
  const dayPeriod = getDateTimePart(timeParts, 'dayPeriod').toLowerCase()

  return `${month} ${day} ${year}, ${hour}:${minute}:${second} ${dayPeriod}`
}
