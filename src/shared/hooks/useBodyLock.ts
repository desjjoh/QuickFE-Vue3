import { onBeforeUnmount } from 'vue'

export function useBodyLock() {
  let previousBodyOverflow = ''
  let previousBodyPaddingRight = ''

  function getScrollbarWidth(): number {
    return Math.abs(window.innerWidth - document.documentElement.clientWidth)
  }

  function lockScroll(): void {
    const scrollbarWidth = getScrollbarWidth()

    previousBodyOverflow = document.body.style.overflow
    previousBodyPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      console.log(scrollbarWidth)
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.setProperty('--scrollbar-compensation-right', `${scrollbarWidth}px`)
    }
  }

  function unlockScroll(): void {
    document.body.style.overflow = previousBodyOverflow
    document.body.style.paddingRight = previousBodyPaddingRight
    document.body.style.removeProperty('--scrollbar-compensation-right')
  }

  onBeforeUnmount(() => {
    unlockScroll()
  })

  return {
    lockScroll,
    unlockScroll,
    getScrollbarWidth,
  }
}
