type CancelLayoutReadiness = () => void

const waitForWindowLoad = (): Promise<void> => {
  if (document.readyState === 'complete') return Promise.resolve()

  return new Promise((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true })
  })
}

const waitForFonts = async (): Promise<void> => {
  if (!('fonts' in document)) return Promise.resolve()
  if (document.fonts.status === 'loaded') return Promise.resolve()

  return document.fonts.ready.then(() => undefined)
}

export const afterLayoutReady = (callback: () => void): CancelLayoutReadiness => {
  let cancelled = false
  let frame = 0

  Promise.all([waitForWindowLoad(), waitForFonts()]).then(() => {
    if (cancelled) return

    frame = window.requestAnimationFrame(() => {
      if (!cancelled) callback()
    })
  })

  return () => {
    cancelled = true
    if (frame) window.cancelAnimationFrame(frame)
  }
}
