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
