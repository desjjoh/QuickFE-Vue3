<template>
  <span ref="triggerWrap" class="tooltip__trigger">
    <slot name="trigger" :triggerAttrs="triggerAttrs"></slot>
  </span>

  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="isOpen"
        :id="tooltipId"
        ref="tooltipEl"
        class="tooltip"
        :style="floatingStyles"
        :data-side="resolvedSide"
        :data-align="resolvedAlign"
        role="tooltip"
      >
        <div ref="arrowRef" class="tooltip__arrow" :style="arrowStyle" aria-hidden="true"></div>
        <slot></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { autoUpdate, flip, offset, shift, useFloating, arrow } from '@floating-ui/vue'
import type { Placement } from '@floating-ui/vue'
import { computed, type ComputedRef, onBeforeUnmount, type Ref, ref, useId } from 'vue'

// TYPES
type Side = 'top' | 'bottom' | 'left' | 'right'
type Align = 'start' | 'center' | 'end'

type Props = {
  disabled?: boolean
  side?: Side
  contentAlign?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  avoidCollisions?: boolean
  openDelay?: number
  closeDelay?: number
}

type TriggerAttrs = {
  'aria-describedby'?: string
  onPointerenter: () => void
  onPointerleave: () => void
  onPointerdown: () => void
  // onFocus: () => void
  // onBlur: () => void
  onKeydown: (e: KeyboardEvent) => void
}

// VARIABLES
const {
  disabled = false,
  side = 'top',
  contentAlign = 'center',
  sideOffset = 6,
  alignOffset = 0,
  collisionPadding = 8,
  avoidCollisions = true,
  openDelay = 150,
  closeDelay = 0,
} = defineProps<Props>()

const isOpen: Ref<boolean> = ref<boolean>(false)

const arrowRef: Ref<HTMLElement | null> = ref(null)
const triggerWrap: Ref<HTMLElement | null> = ref(null)
const triggerAttrs: ComputedRef<TriggerAttrs> = computed(() => ({
  'aria-describedby': isOpen.value ? tooltipId : undefined,
  onPointerenter: scheduleOpen,
  onPointerleave: scheduleClose,
  onPointerdown: onPointerDown,
  // onFocus: scheduleOpen,
  // onBlur: scheduleClose,
  onKeydown,
}))

const tooltipEl: Ref<HTMLElement | null> = ref(null)
const tooltipId: string = useId()

let openTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const placement: ComputedRef<Placement> = computed(() => {
  return contentAlign === 'center' ? side : (`${side}-${contentAlign}` as Placement)
})

const middleware = computed(() => {
  const list = [
    offset({
      mainAxis: sideOffset,
      crossAxis: alignOffset,
    }),
    arrow({
      element: arrowRef,
      padding: collisionPadding,
    }),
  ]

  if (avoidCollisions) {
    list.push(flip({ padding: collisionPadding }), shift({ padding: collisionPadding }))
  }

  return list
})

const {
  floatingStyles,
  placement: resolvedPlacement,
  middlewareData,
} = useFloating(triggerWrap, tooltipEl, {
  placement,
  middleware,
  strategy: 'fixed',
  transform: false,
  open: isOpen,
  whileElementsMounted(reference, floating, update) {
    const cleanupAutoUpdate = autoUpdate(reference, floating, update, {
      ancestorScroll: false,
    })

    document.addEventListener('scroll', close, { capture: true, passive: true })

    return () => {
      cleanupAutoUpdate()
      document.removeEventListener('scroll', close, { capture: true })
    }
  },
})

const resolvedSide = computed(() => resolvedPlacement.value.split('-')[0] ?? side)
const resolvedAlign = computed(() => resolvedPlacement.value.split('-')[1] ?? 'center')

const arrowStyle = computed(() => {
  const arrowData = middlewareData.value.arrow

  if (!arrowData) return {}

  return {
    left: arrowData.x != null ? `${arrowData.x}px` : undefined,
    top: arrowData.y != null ? `${arrowData.y}px` : undefined,
  }
})

// FUNCTIONS
function clearTimers(): void {
  if (openTimer) {
    clearTimeout(openTimer)
    openTimer = null
  }

  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function close(): void {
  clearTimers()
  isOpen.value = false
}

function scheduleOpen(): void {
  if (disabled) return

  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }

  if (isOpen.value) return

  openTimer = setTimeout(() => {
    isOpen.value = true
    openTimer = null
  }, openDelay)
}

function scheduleClose(): void {
  if (openTimer) {
    clearTimeout(openTimer)
    openTimer = null
  }

  if (!isOpen.value) return

  closeTimer = setTimeout(() => {
    isOpen.value = false
    closeTimer = null
  }, closeDelay)
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    close()
  }
}

function onPointerDown(): void {
  close()
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped lang="scss">
$tooltip-sides: (
  top: bottom,
  bottom: top,
  left: right,
  right: left,
);

.tooltip__trigger {
  display: inline-flex;
}

.tooltip {
  --tooltip-z-index: #{z-index(popper)};

  --tooltip-bg: #{color(theme, neutral, reverse-theme, 3)};
  --tooltip-fg: #{color(theme, neutral, reverse-theme, 12)};
  --tooltip-border: #{color(shadow, outline)};

  --tooltip-max-width: 32ch;
  --tooltip-padding-x: #{space(2)};
  --tooltip-padding-y: #{space(1)};
  --tooltip-radius: #{border-radius(sm)};
  --tooltip-shadow: #{box-shadow(2)};

  --tooltip-arrow-width: 12px;
  --tooltip-arrow-height: 6px;
  --tooltip-arrow-border-offset: 1px;

  position: relative;
  z-index: var(--tooltip-z-index);
  pointer-events: none;
  overflow: visible;

  max-width: var(--tooltip-max-width);
  padding: var(--tooltip-padding-y) var(--tooltip-padding-x);
  border-radius: var(--tooltip-radius);

  background-color: var(--tooltip-bg);
  color: var(--tooltip-fg);
  box-shadow: var(--tooltip-shadow);

  line-height: ui-line-height(tight);
  font-size: font-size(sm);

  // TRANSFORM ORIGIN
  @each $side, $origin in $tooltip-sides {
    &[data-side='#{$side}'] {
      transform-origin: #{$origin};
    }
  }
}

.tooltip__arrow {
  position: absolute;
  width: var(--tooltip-arrow-width);
  height: var(--tooltip-arrow-height);
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    display: block;
    width: 0;
    height: 0;
  }
}

// TOP
.tooltip[data-side='top'] .tooltip__arrow {
  bottom: calc(-1 * var(--tooltip-arrow-height));
}

.tooltip[data-side='top'] .tooltip__arrow::before {
  left: 0;
  top: 0;
  border-left: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-right: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-top: var(--tooltip-arrow-height) solid var(--tooltip-border);
}

.tooltip[data-side='top'] .tooltip__arrow::after {
  left: var(--tooltip-arrow-border-offset);
  top: 0;
  border-left: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-right: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-top: calc(var(--tooltip-arrow-height) - var(--tooltip-arrow-border-offset)) solid
    var(--tooltip-bg);
}

// BOTTOM
.tooltip[data-side='bottom'] .tooltip__arrow {
  top: calc(-1 * var(--tooltip-arrow-height));
}

.tooltip[data-side='bottom'] .tooltip__arrow::before {
  left: 0;
  bottom: 0;
  border-left: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-right: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-bottom: var(--tooltip-arrow-height) solid var(--tooltip-border);
}

.tooltip[data-side='bottom'] .tooltip__arrow::after {
  left: var(--tooltip-arrow-border-offset);
  bottom: 0;
  border-left: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-right: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-bottom: calc(var(--tooltip-arrow-height) - var(--tooltip-arrow-border-offset)) solid
    var(--tooltip-bg);
}

// LEFT
.tooltip[data-side='left'] .tooltip__arrow {
  right: calc(-1 * var(--tooltip-arrow-height));
  width: var(--tooltip-arrow-height);
  height: var(--tooltip-arrow-width);
}

.tooltip[data-side='left'] .tooltip__arrow::before {
  left: 0;
  top: 0;
  border-top: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-bottom: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-left: var(--tooltip-arrow-height) solid var(--tooltip-border);
}

.tooltip[data-side='left'] .tooltip__arrow::after {
  left: 0;
  top: var(--tooltip-arrow-border-offset);
  border-top: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-bottom: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-left: calc(var(--tooltip-arrow-height) - var(--tooltip-arrow-border-offset)) solid
    var(--tooltip-bg);
}

// RIGHT
.tooltip[data-side='right'] .tooltip__arrow {
  left: calc(-1 * var(--tooltip-arrow-height));
  width: var(--tooltip-arrow-height);
  height: var(--tooltip-arrow-width);
}

.tooltip[data-side='right'] .tooltip__arrow::before {
  right: 0;
  top: 0;
  border-top: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-bottom: calc(var(--tooltip-arrow-width) / 2) solid transparent;
  border-right: var(--tooltip-arrow-height) solid var(--tooltip-border);
}

.tooltip[data-side='right'] .tooltip__arrow::after {
  right: 0;
  top: var(--tooltip-arrow-border-offset);
  border-top: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-bottom: calc((var(--tooltip-arrow-width) / 2) - var(--tooltip-arrow-border-offset)) solid
    transparent;
  border-right: calc(var(--tooltip-arrow-height) - var(--tooltip-arrow-border-offset)) solid
    var(--tooltip-bg);
}
</style>
