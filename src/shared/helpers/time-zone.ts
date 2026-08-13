export type TimezoneLike = {
  key: string
  label: string
  long_name: string
  offset_minutes: number
  offset_label: string
  region: string
  exemplar_city: string
}

type TimezoneNameStyle =
  | 'short'
  | 'long'
  | 'shortOffset'
  | 'longOffset'
  | 'shortGeneric'
  | 'longGeneric'

const FALLBACK_LOCALE = 'en'
const TIMEZONE_SORT_COLLATOR = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export function sortTimezonesByOffset<TTimezone extends TimezoneLike>(
  timezones: readonly TTimezone[],
): TTimezone[] {
  return [...timezones].sort((first: TTimezone, second: TTimezone): number => {
    const offsetDifference: number = first.offset_minutes - second.offset_minutes

    if (offsetDifference !== 0) {
      return offsetDifference
    }

    const cityDifference: number = TIMEZONE_SORT_COLLATOR.compare(first.key, second.key)

    if (cityDifference !== 0) {
      return cityDifference
    }

    return TIMEZONE_SORT_COLLATOR.compare(first.key, second.key)
  })
}

export const getTimezoneOffsetMinutes = (timeZone: string, date: Date = new Date()): number => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts.map((part: Intl.DateTimeFormatPart): [string, string] => [part.type, part.value]),
  )

  const localTimestampAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  )

  return Math.round((localTimestampAsUtc - date.getTime()) / 60000)
}

export const formatOffsetLabel = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)

  const hours = Math.floor(absoluteMinutes / 60)
    .toString()
    .padStart(2, '0')

  const minutes = (absoluteMinutes % 60).toString().padStart(2, '0')

  return `${sign}${hours}:${minutes}`
}

export const getTimezoneName = (
  timeZone: string,
  timeZoneName: TimezoneNameStyle,
  locale: string = FALLBACK_LOCALE,
): string => {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName,
  })

  return (
    formatter
      .formatToParts(new Date())
      .find((part: Intl.DateTimeFormatPart) => part.type === 'timeZoneName')?.value ?? timeZone
  )
}
