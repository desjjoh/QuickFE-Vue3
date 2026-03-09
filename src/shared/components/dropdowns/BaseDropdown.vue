<template>
  <div class="dropdown" :data-open="isOpen ? 'true' : 'false'">
    <!-- DROPDOWN TRIGGER -->
    <span ref="triggerWrap" class="dropdown__trigger" @keydown="onTriggerKeydown">
      <slot
        name="trigger"
        :isOpen="isOpen"
        :toggle="toggle"
        :open="open"
        :close="close"
        :triggerAttrs="triggerAttrs"
      ></slot>
    </span>

    <!-- DROPDOWN MENU -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="menuId"
        :style="menuStyle"
        ref="menuEl"
        class="dropdown__menu"
        role="menu"
        tabindex="-1"
        @keydown="onMenuKeydown"
        @click="onMenuClick"
      >
        <slot :close="close"></slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, reactive, ref, useId } from 'vue'
import type { ComputedRef, CSSProperties, Ref } from 'vue'
import { DropdownMenuContextKey, type DropdownMenuContext } from './types'

// TYPES
type Props = {
  closeOnSelect?: boolean
  disabled?: boolean
  modal?: boolean
}

type position = {
  top: number
  left: number
  minWidth: number
}

// VARIABLE DECLARATIONS
const { closeOnSelect = true, disabled = false, modal = true } = defineProps<Props>()

const isOpen: Ref<boolean> = ref<boolean>(false)
const triggerWrap: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const menuEl: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)

const menuId: string = useId()
const pos: position = reactive<position>({ top: 0, left: 0, minWidth: 0 })

const triggerAttrs: ComputedRef<CSSProperties> = computed<CSSProperties>(() => ({
  'aria-haspopup': 'menu',
  'aria-expanded': isOpen.value ? 'true' : 'false',
  'aria-controls': menuId,
}))

const menuStyle: ComputedRef<CSSProperties> = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: `${pos.top}px`,
  left: `${pos.left}px`,
  minWidth: `${pos.minWidth}px`,
  zIndex: 1000,
}))

// UTILITIES
function getTriggerEl(): HTMLElement | null {
  return triggerWrap.value
}

function measureAndPosition(): void {
  const trigger = getTriggerEl()
  const menu = menuEl.value

  if (!trigger || !menu) return

  const triggerRect = trigger.getBoundingClientRect()
  const menuRect = menu.getBoundingClientRect()

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const gap = 8

  let top = triggerRect.bottom + gap
  let left = triggerRect.left

  const minWidth = triggerRect.width

  if (left + menuRect.width > viewportWidth - gap)
    left = Math.max(gap, viewportWidth - menuRect.width - gap)

  if (left < gap) left = gap

  if (top + menuRect.height > viewportHeight - gap) {
    const aboveTop = triggerRect.top - menuRect.height - gap

    if (aboveTop >= gap) top = aboveTop
    else top = Math.max(gap, viewportHeight - menuRect.height - gap)
  }

  pos.top = Math.round(top)
  pos.left = Math.round(left)
  pos.minWidth = Math.round(minWidth)
}

function getMenuItems(): HTMLElement[] {
  const root: HTMLElement | null = menuEl.value

  if (!root) return []

  return Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
    (el) => !el.hasAttribute('aria-disabled') && !el.hasAttribute('disabled'),
  )
}

function focusItem(index: number): void {
  const items: HTMLElement[] = getMenuItems()
  if (!items.length) return

  const wrapped = (index + items.length) % items.length
  items[wrapped]?.focus()
}

function focusTrigger(): void {
  const trigger: HTMLElement | null = triggerWrap.value?.firstElementChild as HTMLElement | null
  trigger?.focus?.()
}

function focusMenu(): void {
  menuEl.value?.focus()
}

let previousBodyOverflow: string = ''

function lockBodyScroll(): void {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll(): void {
  document.body.style.overflow = previousBodyOverflow
}

async function open() {
  if (disabled || isOpen.value) return
  isOpen.value = true

  if (modal) lockBodyScroll()

  await nextTick()
  measureAndPosition()

  await nextTick()

  focusMenu()
  addGlobalListeners()
}

function close(options?: { restoreFocus?: boolean }): void {
  if (!isOpen.value) return

  isOpen.value = false
  removeGlobalListeners()

  if (modal) unlockBodyScroll()

  const shouldRestoreFocus: boolean = options?.restoreFocus ?? true
  if (!shouldRestoreFocus) return

  focusTrigger()
}

function toggle(): void {
  if (isOpen.value) close()
  else void open()
}

// ACTIONS
function onTriggerKeydown(e: KeyboardEvent): void {
  if (disabled) return

  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      void toggle()
      break
    case 'ArrowDown':
      e.preventDefault()
      focusItem(0)
      break
    case 'ArrowUp':
      const items = getMenuItems()
      focusItem(items.length - 1)
      break
    case 'Escape':
      e.preventDefault()
      if (isOpen.value) close()
      break
  }
}

function onMenuKeydown(e: KeyboardEvent): void {
  const items: HTMLElement[] = getMenuItems()

  if (!items.length) {
    if (e.key === 'Escape') close()
    return
  }

  const activeIndex: number = items.findIndex((el) => el === document.activeElement)

  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'ArrowDown':
      e.preventDefault()
      focusItem(activeIndex < 0 ? 0 : activeIndex + 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusItem(activeIndex < 0 ? items.length - 1 : activeIndex - 1)
      break
    case 'Home':
      e.preventDefault()
      focusItem(0)
      break
    case 'End':
      e.preventDefault()
      focusItem(items.length - 1)
      break
    case 'Tab':
      e.preventDefault()
      break
  }
}

function onMenuClick(e: MouseEvent): void {
  if (!closeOnSelect) return

  const target: HTMLElement | null = e.target as HTMLElement | null
  const item: HTMLElement | null = target?.closest?.('[role="menuitem"]') as HTMLElement | null

  if (!item) return
  if (item.hasAttribute('aria-disabled') || item.hasAttribute('disabled')) return

  close()
}

function onDocumentKeydown(e: KeyboardEvent): void {
  if (!isOpen.value) return

  const menu = menuEl.value
  const trigger = triggerWrap.value

  const target = e.target as Node
  if (menu?.contains(target) || trigger?.contains(target)) return

  e.preventDefault()
  e.stopPropagation()
}

function onDocumentFocusIn(e: FocusEvent): void {
  const target = e.target as Node

  const trigger = triggerWrap.value
  const menu = menuEl.value

  if (trigger?.contains(target) || menu?.contains(target)) return

  close()
}

function onDocPointerDown(e: PointerEvent): void {
  const t: Node = e.target as Node

  const trigger: HTMLElement | null = triggerWrap.value
  const menu: HTMLElement | null = menuEl.value

  if (trigger?.contains(t) || menu?.contains(t)) return

  close({ restoreFocus: false })
}

function onWindowChange(): void {
  if (!isOpen.value) return

  measureAndPosition()
}

// GLOBAL LISTENERS
function addGlobalListeners(): void {
  document.addEventListener('pointerdown', onDocPointerDown, true)
  document.addEventListener('focusin', onDocumentFocusIn)
  document.addEventListener('keydown', onDocumentKeydown, true)

  window.addEventListener('resize', onWindowChange)
  window.addEventListener('scroll', onWindowChange, true)
}

function removeGlobalListeners(): void {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('focusin', onDocumentFocusIn)
  document.removeEventListener('keydown', onDocumentKeydown, true)

  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, true)
}

// LIFECYCLE HOOKS
onBeforeUnmount(() => {
  removeGlobalListeners()
})

const dropdownContext: DropdownMenuContext = {
  focusTrigger,
  focusMenu,
  close,
}

provide(DropdownMenuContextKey, dropdownContext)
</script>

<style scoped lang="scss">
.dropdown {
  & .dropdown__trigger {
    display: inline-block;
  }
}

.dropdown__menu {
  outline: none;

  background: color(bg, surface);
  border-radius: border-radius(md);
  box-shadow: box-shadow(4);

  max-height: space(80);
  overflow: auto;

  scrollbar-width: thin;
  scrollbar-color: #{color(theme, neutral, dark-alpha, 8)} transparent;
}
</style>
