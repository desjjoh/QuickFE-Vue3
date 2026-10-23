/** Unlike a localStorage read followed by a write, Web Locks serialize tabs atomically. */
export async function withBrowserLock<T>(name: string, work: () => Promise<T>): Promise<T> {
  if (typeof navigator.locks?.request !== 'function') return work()

  return await navigator.locks.request(name, work)
}
