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

const TIMEZONE_NAME_STYLES: readonly TimezoneNameStyle[] = [
  'longGeneric',
  'long',
  'shortGeneric',
  'short',
]

const TIMEZONE_OFFSET_STYLES: readonly TimezoneNameStyle[] = ['longOffset', 'shortOffset']

function timezoneFormatter(
  locale: string,
  timezoneKey: string,
  timezoneName: TimezoneNameStyle,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale || FALLBACK_LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneKey,
    timeZoneName: timezoneName as Intl.DateTimeFormatOptions['timeZoneName'],
  })
}

function timezonePart(
  locale: string,
  timezoneKey: string,
  timezoneName: TimezoneNameStyle,
  date: Date,
): string | null {
  try {
    const formatter: Intl.DateTimeFormat = timezoneFormatter(locale, timezoneKey, timezoneName)
    const parts: Intl.DateTimeFormatPart[] = formatter.formatToParts(date)

    const part: Intl.DateTimeFormatPart | undefined = parts.find(
      (value: Intl.DateTimeFormatPart): boolean => value.type === 'timeZoneName',
    )

    return part?.value ?? null
  } catch {
    return null
  }
}

function firstTimezonePart(
  locale: string,
  timezoneKey: string,
  styles: readonly TimezoneNameStyle[],
  date: Date,
): string | null {
  for (const style of styles) {
    const value: string | null = timezonePart(locale, timezoneKey, style, date)

    if (value) return value
  }

  return null
}

export function getLocalizedTimezoneLabel(
  timezone: TimezoneLike,
  locale: string,
  date: Date = new Date(),
): string {
  const offset: string =
    firstTimezonePart(locale, timezone.key, TIMEZONE_OFFSET_STYLES, date) ??
    timezone.long_name ??
    timezone.label

  const name: string =
    firstTimezonePart(locale, timezone.key, TIMEZONE_NAME_STYLES, date) ??
    timezone.long_name ??
    timezone.label

  if (!timezone.exemplar_city) return `${name} (${offset})`

  return `${offset} — ${timezone.exemplar_city}`
}

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

    const cityDifference: number = TIMEZONE_SORT_COLLATOR.compare(
      first.exemplar_city,
      second.exemplar_city,
    )

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
