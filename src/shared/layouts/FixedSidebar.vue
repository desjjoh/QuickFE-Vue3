<template>
  <div class="sidebar-layout" :style="sidebarStyle">
    <aside
      ref="sidebarRef"
      class="sidebar-layout__sidebar"
      :class="{ 'sidebar-layout__sidebar--top': isMobile }"
    >
      <slot name="sidebar"></slot>
    </aside>

    <div class="sidebar-layout__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

import { assertDefined } from '@/helpers/assert'
import { APP_SHELL_SCROLL_REF_KEY } from '@/helpers/window'
import { useViewport } from '../hooks/useViewport'

const { isMobile } = useViewport()

const sidebarRef = ref<HTMLElement | null>(null)
const sidebarWidth = ref<number>(0)
const scrollbarBottom = ref<number>(0)

const appShellScrollRef = inject(APP_SHELL_SCROLL_REF_KEY)
assertDefined(appShellScrollRef, '[FixedSidebar] must be used inside <AppFrame>.')

let sidebarObserver: ResizeObserver | null = null
let shellObserver: ResizeObserver | null = null
let currentShellEl: HTMLElement | null = null

const updateSidebarWidth = (): void => {
  if (!sidebarRef.value) return
  sidebarWidth.value = sidebarRef.value.offsetWidth
}

const updateScrollbarCompensation = (): void => {
  if (!currentShellEl) {
    scrollbarBottom.value = 0
    return
  }

  scrollbarBottom.value = currentShellEl.offsetHeight - currentShellEl.clientHeight
}

const bindShell = (el: HTMLElement | null): void => {
  shellObserver?.disconnect()

  if (currentShellEl) currentShellEl.removeEventListener('scroll', updateScrollbarCompensation)
  currentShellEl = el

  if (!currentShellEl) {
    scrollbarBottom.value = 0
    return
  }

  updateScrollbarCompensation()

  shellObserver = new ResizeObserver(() => {
    updateScrollbarCompensation()
  })

  shellObserver.observe(currentShellEl)
  currentShellEl.addEventListener('scroll', updateScrollbarCompensation, { passive: true })
}

onMounted(() => {
  updateSidebarWidth()

  sidebarObserver = new ResizeObserver(() => {
    updateSidebarWidth()
  })

  if (sidebarRef.value) sidebarObserver.observe(sidebarRef.value)

  bindShell(appShellScrollRef.value)
})

onBeforeUnmount(() => {
  sidebarObserver?.disconnect()
  shellObserver?.disconnect()

  if (currentShellEl) currentShellEl.removeEventListener('scroll', updateScrollbarCompensation)
})

const sidebarStyle = computed<Record<string, string>>(() => {
  return {
    '--sidebar-width': `${sidebarWidth.value}px`,
    '--app-scrollbar-compensation-bottom': `${scrollbarBottom.value}px`,
  }
})
</script>

<style scoped lang="scss">
.sidebar-layout {
  min-width: 100%;
  height: 100%;
  flex: 1 1 auto;

  & .sidebar-layout__sidebar {
    position: fixed;

    top: $masthead-height;
    left: 0;
    bottom: var(--app-scrollbar-compensation-bottom, 0px);

    overflow: auto;

    background: color(bg, page);
    box-shadow: 1px 0 color(shadow, outline);

    z-index: z-index(sticky);
  }

  & .sidebar-layout__content {
    margin-left: var(--sidebar-width);
    height: 100%;
    flex: 1 1 auto;
  }

  & .sidebar-layout__sidebar--top {
    position: sticky;

    top: $masthead-height;
    left: auto;
    bottom: auto;

    width: 100%;
    padding: 0;
    overflow: visible;

    box-shadow: 0 1px color(shadow, outline);
  }

  &:has(.sidebar-layout__sidebar--top) {
    display: flex;
    flex-direction: column;

    & .sidebar-layout__content {
      margin-left: 0;
      height: auto;
    }
  }
}
</style>
