<template>
  <button
    ref="el"
    class="menu-item"
    :class="[active && 'is-active']"
    type="button"
    role="menuitem"
    :disabled="disabled"
    :data-disabled="disabled ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : undefined"
    @pointerleave="onPointerLeave"
    @pointermove="onPointerMove"
  >
    <span class="button__content">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { inject, type Ref, ref } from 'vue'
import { DropdownMenuContextKey, type DropdownMenuContext } from './types'
import { assertDefined } from '@/helpers/functions'

const props = withDefaults(
  defineProps<{
    active?: boolean
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const context: DropdownMenuContext | undefined = inject(DropdownMenuContextKey)
assertDefined(context, 'MenuItemButton must be used inside DropdownMenu')

const el: Ref<HTMLButtonElement | null> = ref(null)

function onPointerMove(): void {
  if (props.disabled) return
  if (!el.value) return

  el.value?.focus()
}

function onPointerLeave(): void {
  if (document.activeElement !== el.value) return
  context?.focusMenu()
}
</script>

<style lang="scss" scoped>
.menu-item {
  display: inline-flex;
  align-items: center;
  justify-content: start;

  gap: space(2);

  appearance: none;
  border: 0;
  background: transparent;

  color: color(text, primary);

  height: space(8);
  width: 100%;
  padding: space(2) space(3);

  border-radius: border-radius(sm);

  cursor: pointer;

  & .button__content {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4em;

    transition: opacity 150ms ease;
  }

  &.is-active {
    background: color(theme, neutral, dark-alpha, 3);
  }

  &:focus,
  &:active {
    outline: none;
    background: color(theme, primary, dark-alpha, 4);
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
