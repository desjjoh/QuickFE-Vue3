import type { IdempotencyOptions } from './request'

function canonicalPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalPayload)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonicalPayload(entry)]),
    )
  }
  return value
}

/** Keep one instance per open form: unchanged retries reuse the key, edits get a new key. */
export function createIdempotentActionOptions(): (
  payload: unknown,
  file?: File,
) => IdempotencyOptions {
  let previousPayload: string | undefined
  let previousFile: File | undefined
  let key: string | undefined
  return (payload, file) => {
    const serialized = JSON.stringify(canonicalPayload(payload))
    // Selecting a different File is a new action, even when its metadata matches.
    if (!key || serialized !== previousPayload || file !== previousFile) {
      key = crypto.randomUUID()
      previousPayload = serialized
      previousFile = file
    }
    return { idempotencyKey: key }
  }
}
