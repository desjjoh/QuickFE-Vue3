import { computed, ref, type CSSProperties } from 'vue'

const START_PROGRESS = 8
const MAX_LOADING_PROGRESS = 92
const COMPLETE_PROGRESS = 100
const HIDE_DELAY_MS = 180
const TRICKLE_INTERVAL_MS = 220

const isVisible = ref(false)
const progress = ref(0)

let activeLoadCount = 0
let hideTimer: ReturnType<typeof window.setTimeout> | undefined
let trickleTimer: ReturnType<typeof window.setInterval> | undefined

const barStyle = computed<CSSProperties>(() => ({
  transform: `scaleX(${progress.value / 100})`,
}))

function clearHideTimer(): void {
  if (!hideTimer) return

  window.clearTimeout(hideTimer)
  hideTimer = undefined
}

function clearTrickleTimer(): void {
  if (!trickleTimer) return

  window.clearInterval(trickleTimer)
  trickleTimer = undefined
}

function advanceProgress(): void {
  const remaining = MAX_LOADING_PROGRESS - progress.value
  const increment = Math.max(0.5, remaining * 0.16)

  progress.value = Math.min(MAX_LOADING_PROGRESS, progress.value + increment)
}

function startTrickle(): void {
  if (trickleTimer) return

  trickleTimer = window.setInterval(advanceProgress, TRICKLE_INTERVAL_MS)
}

function startPageLoad(): void {
  activeLoadCount += 1
  clearHideTimer()

  if (activeLoadCount > 1) return

  progress.value = Math.max(progress.value, START_PROGRESS)
  isVisible.value = true
  startTrickle()
}

function finishPageLoad(): void {
  activeLoadCount = Math.max(0, activeLoadCount - 1)
  if (activeLoadCount > 0) return

  clearTrickleTimer()

  if (!isVisible.value) {
    progress.value = 0
    return
  }

  progress.value = COMPLETE_PROGRESS
  hideTimer = window.setTimeout(() => {
    hideTimer = undefined
    isVisible.value = false
    progress.value = 0
  }, HIDE_DELAY_MS)
}

function resetPageLoadProgress(): void {
  activeLoadCount = 0
  clearHideTimer()
  clearTrickleTimer()
  isVisible.value = false
  progress.value = 0
}

export function usePageLoadProgress() {
  return {
    barStyle,
    finishPageLoad,
    isVisible,
    progress,
    resetPageLoadProgress,
    startPageLoad,
  }
}
