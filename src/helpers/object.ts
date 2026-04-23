export const deepEqual = (x: unknown, y: unknown): boolean => {
  if (Object.is(x, y)) return true

  if (x == null || y == null) return false

  if (typeof x !== 'object' || typeof y !== 'object') return false

  if (x.constructor !== y.constructor) return false

  if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime()

  if (Array.isArray(x) && Array.isArray(y)) {
    if (x.length !== y.length) return false

    return x.every((item, index) => deepEqual(item, y[index]))
  }

  if (Array.isArray(x) || Array.isArray(y)) return false

  const keysX = Object.keys(x as Record<string, unknown>)
  const keysY = Object.keys(y as Record<string, unknown>)

  if (keysX.length !== keysY.length) return false

  return keysX.every((key) =>
    deepEqual((x as Record<string, unknown>)[key], (y as Record<string, unknown>)[key]),
  )
}

export const checkIds = (x: unknown, y: unknown): boolean => {
  const ctx = typeof x
  const ty = typeof y

  return ctx === ty && (x as Record<string, unknown>)['id'] == (y as Record<string, unknown>)['id']
}
