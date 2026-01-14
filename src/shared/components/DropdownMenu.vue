<template>
  <div class="dropdown" :data-open="isOpen ? 'true' : 'false'">
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

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="menuEl"
        class="dropdown__menu"
        :style="menuStyle"
        role="menu"
        :id="menuId"
        @keydown="onMenuKeydown"
        @click="onMenuClick"
      >
        <slot :close="close"></slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import type { ComputedRef, CSSProperties, Ref } from 'vue'

type Props = {
  closeOnSelect?: boolean
  disabled?: boolean
}

type position = {
  top: number
  left: number
  minWidth: number
}

const { closeOnSelect = true, disabled = false } = defineProps<Props>()

const isOpen: Ref<boolean> = ref<boolean>(false)
const triggerWrap: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const menuEl: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)

const menuId: string = `dropdown-menu-${Math.random().toString(36).slice(2)}`
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

function measureAndPosition() {
  const trigger: HTMLElement | null = triggerWrap.value?.firstElementChild as HTMLElement | null

  if (!trigger) return

  const r: DOMRect = trigger.getBoundingClientRect()

  pos.top = Math.round(r.bottom)
  pos.left = Math.round(r.left)
  pos.minWidth = Math.round(r.width)
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

  const clamped: number = Math.max(0, Math.min(index, items.length - 1))
  items[clamped]?.focus()
}

async function open() {
  if (disabled || isOpen.value) return
  isOpen.value = true

  await nextTick()

  measureAndPosition()

  await nextTick()

  focusItem(0)
  addGlobalListeners()
}

function close(): void {
  if (!isOpen.value) return

  isOpen.value = false
  removeGlobalListeners()

  const trigger: HTMLElement | null = triggerWrap.value?.firstElementChild as HTMLElement | null
  trigger?.focus?.()
}

function toggle(): void {
  if (isOpen.value) close()
  else void open()
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (disabled) return

  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
    e.preventDefault()
    void open()
  }

  if (e.key === 'Escape' && isOpen.value) {
    e.preventDefault()
    close()
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
      close()
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

function onDocPointerDown(e: PointerEvent): void {
  const t: Node = e.target as Node

  const trigger: HTMLElement | null = triggerWrap.value
  const menu: HTMLElement | null = menuEl.value

  if (trigger?.contains(t) || menu?.contains(t)) return

  close()
}

function onWindowChange(): void {
  if (!isOpen.value) return

  measureAndPosition()
}

function addGlobalListeners(): void {
  document.addEventListener('pointerdown', onDocPointerDown, true)

  window.addEventListener('resize', onWindowChange)
  window.addEventListener('scroll', onWindowChange, true)
}

function removeGlobalListeners(): void {
  document.removeEventListener('pointerdown', onDocPointerDown, true)

  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, true)
}

onBeforeUnmount(() => {
  removeGlobalListeners()
})
</script>

<style scoped lang="scss">
.dropdown__menu {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  padding: 6px;
}
</style>
