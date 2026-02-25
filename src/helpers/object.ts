export const deepEqual = (x: unknown, y: unknown): boolean => {
  const tx = typeof x
  const ty = typeof y

  if (x && y && tx === 'object' && ty === 'object') {
    const keysX = Object.keys(x as Record<string, unknown>)
    const keysY = Object.keys(y as Record<string, unknown>)

    if (keysX.length !== keysY.length) return false

    return keysX.every((key) =>
      deepEqual((x as Record<string, unknown>)[key], (y as Record<string, unknown>)[key]),
    )
  }

  return x === y
}

export const checkIds = (x: unknown, y: unknown): boolean => {
  const ctx = typeof x
  const ty = typeof y

  return ctx === ty && (x as Record<string, unknown>)['id'] == (y as Record<string, unknown>)['id']
}
