<template>
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
    <Transition name="dropdown" @after-enter="handleAfterEnter" @after-leave="handleAfterLeave">
      <div
        v-if="keepMounted || isOpen"
        v-show="isOpen"
        :id="menuId"
        :style="floatingStyles"
        :data-side="resolvedSide"
        :data-align="resolvedAlign"
        ref="menuEl"
        class="dropdown__menu"
        role="menu"
        tabindex="-1"
        @keydown="onMenuKeydown"
        @click="onMenuClick"
      >
        <slot :close="close"></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, useId, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import { createFocusTrap, type FocusTrap } from 'focus-trap'
import { autoUpdate, flip, offset, size, useFloating } from '@floating-ui/vue'

import {
  DropdownMenuContextKey,
  type Align,
  type Props,
  type Side,
  type TriggerAttrs,
} from '@/library/types/components/dropdowns'
import { useDismissableLayer } from '@/shared/hooks/useDismissableLayer'

// VARIABLE DECLARATIONS
const {
  closeOnSelect = true,
  disabled = false,
  side = 'bottom',
  contentAlign = 'start',
  sideOffset = 8,
  alignOffset = 0,
  matchTriggerWidth = false,
  collisionPadding = 8,
  avoidCollisions = true,
  keepMounted = false,
} = defineProps<Props>()

const isOpen: Ref<boolean> = ref<boolean>(false)
const triggerWrap: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const menuEl: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const menuId: string = useId()
const triggerAttrs: ComputedRef<TriggerAttrs> = computed<TriggerAttrs>(() => ({
  'aria-haspopup': 'menu',
  'aria-expanded': isOpen.value ? 'true' : 'false',
  'aria-controls': menuId,
}))

const placement = computed(() => {
  return contentAlign === 'center'
    ? side
    : (`${side}-${contentAlign}` as `${Side}-${Exclude<Align, 'center'>}`)
})

const middleware = computed(() => {
  const list = [
    offset({
      mainAxis: sideOffset,
      crossAxis: alignOffset,
    }),
  ]

  if (avoidCollisions)
    list.push(
      flip({
        padding: collisionPadding,
      }),
    )

  if (matchTriggerWidth)
    list.push(
      size({
        padding: collisionPadding,
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            minWidth: `${Math.round(rects.reference.width)}px`,
            maxHeight: `${Math.max(0, Math.floor(availableHeight))}px`,
          })
        },
      }),
    )

  return list
})

const { floatingStyles, placement: resolvedPlacement } = useFloating(triggerWrap, menuEl, {
  placement,
  middleware,
  strategy: 'fixed',
  transform: false,
  open: isOpen,
  whileElementsMounted: autoUpdate,
})

const resolvedSide = computed(() => resolvedPlacement.value.split('-')[0] ?? side)
const resolvedAlign = computed(() => resolvedPlacement.value.split('-')[1] ?? 'center')

let focusTrap: FocusTrap | null = null
let menuItems: HTMLElement[] = []
let pointerFocusFrame: number | null = null
let pendingFocusItem: HTMLElement | null = null

// UTILITIES
function getMenuItems(): HTMLElement[] {
  const root: HTMLElement | null = menuEl.value

  if (!root) return []

  return Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
    (el) => !el.hasAttribute('aria-disabled') && !el.hasAttribute('disabled'),
  )
}

function refreshMenuItems(): HTMLElement[] {
  menuItems = getMenuItems()
  return menuItems
}

function activateFocusTrap(): void {
  if (!menuEl.value) return

  focusTrap = createFocusTrap(menuEl.value, {
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
    returnFocusOnDeactivate: false,
    fallbackFocus: menuEl.value,
    initialFocus:
      (menuEl.value.querySelector('[data-autofocus]') as HTMLElement | null) ?? menuEl.value,
  })

  focusTrap.activate()
}

function deactivateFocusTrap(): void {
  focusTrap?.deactivate()
  focusTrap = null
}

function handleAfterEnter(): void {
  refreshMenuItems()
  activateFocusTrap()
}

function handleAfterLeave(): void {
  deactivateFocusTrap()
  menuItems = []
}

function focusItem(index: number): void {
  const items: HTMLElement[] = menuItems.length ? menuItems : refreshMenuItems()
  if (!items.length) return

  const wrapped = (index + items.length) % items.length
  const item = items[wrapped]

  if (document.activeElement === item) return

  item?.focus()
  item?.scrollIntoView({ block: 'nearest' })
}

function focusTrigger(): void {
  const trigger: HTMLElement | null = triggerWrap.value?.firstElementChild as HTMLElement | null
  trigger?.focus?.()
}

function focusMenu(): void {
  menuEl.value?.focus()
}

function requestItemFocus(item: HTMLElement): void {
  if (document.activeElement === item) return

  pendingFocusItem = item

  if (pointerFocusFrame !== null) return

  pointerFocusFrame = window.requestAnimationFrame(() => {
    pointerFocusFrame = null

    if (!pendingFocusItem || document.activeElement === pendingFocusItem) return

    pendingFocusItem.focus()
    pendingFocusItem = null
  })
}

// CONTROLS
async function open() {
  if (disabled || isOpen.value) return

  isOpen.value = true
  await nextTick()
  refreshMenuItems()
}

function close(options?: { restoreFocus?: boolean }): void {
  if (!isOpen.value) return

  isOpen.value = false

  if (options?.restoreFocus) focusTrigger()
}

function toggle(): void {
  if (isOpen.value) close()
  else void open()
}

// ACTIONS
async function onTriggerKeydown(e: KeyboardEvent): Promise<void> {
  if (disabled) return

  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      void toggle()
      break
    case 'ArrowDown':
      e.preventDefault()

      if (!isOpen.value) await open()
      await nextTick()

      focusItem(0)

      break
    case 'ArrowUp':
      e.preventDefault()

      if (!isOpen.value) await open()
      await nextTick()

      const items = menuItems.length ? menuItems : refreshMenuItems()
      focusItem(items.length - 1)

      break
    case 'Escape':
      e.preventDefault()

      if (isOpen.value) close()

      break
  }
}

function onMenuKeydown(e: KeyboardEvent): void {
  if (e.repeat) {
    e.preventDefault()

    return
  }

  const items: HTMLElement[] = menuItems.length ? menuItems : refreshMenuItems()

  if (!items.length) {
    if (e.key === 'Escape') close()

    return
  }

  const activeIndex: number = items.findIndex((el) => el === document.activeElement)

  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      close({ restoreFocus: true })
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
    case 'Enter':
    case ' ':
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

function onOutsideKeydown(e: KeyboardEvent): void {
  e.preventDefault()
  e.stopPropagation()
}

function cancelPendingPointerFocus(): void {
  pendingFocusItem = null

  if (pointerFocusFrame === null) return

  window.cancelAnimationFrame(pointerFocusFrame)
  pointerFocusFrame = null
}

// LIFECYCLE HOOKS
useDismissableLayer({
  isOpen,
  triggerRef: triggerWrap,
  contentRef: menuEl,
  onDismiss: () => close({ restoreFocus: false }),
  onOutsideKeydown,
})

watch(isOpen, (open: boolean) => {
  if (open) return

  deactivateFocusTrap()
  cancelPendingPointerFocus()
})

onBeforeUnmount(() => {
  deactivateFocusTrap()
  cancelPendingPointerFocus()
})

provide(DropdownMenuContextKey, {
  focusTrigger,
  focusMenu,
  requestItemFocus,
  close,
})
</script>

<style scoped lang="scss">
.dropdown__trigger {
  display: inline-flex;
  align-items: center;
  line-height: 0;
  vertical-align: top;
}

.dropdown__menu {
  outline: none;

  background: color(bg, surface);
  border-radius: border-radius(md);
  box-shadow: box-shadow(3);

  max-height: space(100);
  min-width: space(40);

  overflow: auto;
  overscroll-behavior: contain;

  scrollbar-width: thin;
  scrollbar-color: #{color(theme, neutral, theme-alpha, 8)} transparent;

  z-index: z-index(popper);
}

.dropdown__menu[data-side='top'] {
  transform-origin: bottom;
}

.dropdown__menu[data-side='bottom'] {
  transform-origin: top;
}
</style>
