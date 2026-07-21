type ErrorMessageValue = string | string[]

type ErrorResponseData = {
  message?: ErrorMessageValue
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getResponseData(error: unknown): ErrorResponseData | undefined {
  if (!isRecord(error)) return undefined

  const response = error.response

  if (!isRecord(response)) return undefined

  const data = response.data

  if (!isRecord(data)) return undefined

  const message = data.message

  if (typeof message === 'string' || Array.isArray(message)) return { message }

  return undefined
}

export function getFallbackMessage(error: unknown): string {
  if (isRecord(error) && typeof error.message === 'string') return error.message

  return 'An unexpected error occurred.'
}

export function getStack(error: unknown): string | undefined {
  if (isRecord(error) && typeof error.stack === 'string') return error.stack

  return undefined
}

function resolveMessage(error: unknown): string {
  const data = getResponseData(error)
  const fallbackMessage = getFallbackMessage(error)

  if (Array.isArray(data?.message)) return data.message[0] ?? fallbackMessage

  return data?.message ?? fallbackMessage
}

export function useErrorMessage() {
  function getErrorMessage(error: unknown): string {
    const message = resolveMessage(error)
    const stack = getFallbackMessage(error)

    console.error(`${stack} — Reason: ${message}`)

    return message
  }

  return {
    getErrorMessage,
  }
}
