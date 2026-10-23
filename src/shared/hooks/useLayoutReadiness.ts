type CancelLayoutReadiness = () => void

const waitForWindowLoad = (signal: AbortSignal): Promise<void> => {
  if (document.readyState === 'complete') return Promise.resolve()

  return new Promise((resolve) => {
    const finish = () => {
      window.removeEventListener('load', finish)
      signal.removeEventListener('abort', finish)
      resolve()
    }

    window.addEventListener('load', finish, { once: true })
    signal.addEventListener('abort', finish, { once: true })
  })
}

const waitForFonts = async (): Promise<void> => {
  if (!('fonts' in document)) return Promise.resolve()
  if (document.fonts.status === 'loaded') return Promise.resolve()

  return document.fonts.ready.then(
    () => undefined,
    () => undefined,
  )
}

export const afterLayoutReady = (callback: () => void): CancelLayoutReadiness => {
  let cancelled = false
  let frame = 0
  const controller = new AbortController()

  Promise.all([waitForWindowLoad(controller.signal), waitForFonts()]).then(() => {
    if (cancelled) return

    frame = window.requestAnimationFrame(() => {
      if (!cancelled) callback()
    })
  })

  return () => {
    cancelled = true
    controller.abort()
    if (frame) window.cancelAnimationFrame(frame)
  }
}
