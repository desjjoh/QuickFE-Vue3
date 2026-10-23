type ILocalStorageUtil<T> = {
  getItem: () => T | null
  saveItem: (data: T) => boolean
  destroyItem: () => void
}

/** Browser persistence is optional; serialization errors remain programmer errors. */
function useLocalStorageUtil<T>(
  key: string,
  validate?: (value: unknown) => value is T,
): ILocalStorageUtil<T> {
  function destroyItem(): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Storage can be disabled by browser policy; in-memory state remains usable.
    }
  }

  function getItem(): T | null {
    try {
      const raw = window.localStorage.getItem(key)

      if (raw === null) return null
      const value: unknown = JSON.parse(raw)

      if (!validate || validate(value)) return value as T
    } catch {
      // Treat inaccessible or corrupt persistence as a cache miss.
    }

    destroyItem()

    return null
  }

  function saveItem(data: T): boolean {
    const serialized = JSON.stringify(data)

    if (serialized === undefined) return false

    try {
      window.localStorage.setItem(key, serialized)

      return true
    } catch {
      // Quota/security failures must not interrupt session cleanup or UI changes.
      return false
    }
  }

  return { getItem, saveItem, destroyItem }
}

export { useLocalStorageUtil }
export type { ILocalStorageUtil }
