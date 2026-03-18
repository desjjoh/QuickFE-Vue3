<template>
  <button
    ref="el"
    class="menu-item"
    :class="[active && 'is-active', `tone-${tone}`]"
    type="button"
    role="menuitem"
    :disabled="disabled"
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
import { DropdownMenuContextKey, type DropdownMenuContext, type Tone } from './types'
import { assertDefined } from '@/helpers/functions'

const props = withDefaults(
  defineProps<{
    active?: boolean
    disabled?: boolean
    tone?: Tone
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
$button-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.menu-item {
  // NOTE :
  // When transitions are active, rapid focus swap causes a visual glitch when changing the background color
  // This issue is resolved by using box shadow.

  // transition: background-color 150ms ease;
  // transition: box-shadow 150ms ease;

  // box-shadow: inset 0 0 0 9999px color(theme, #{$palette}, dark-alpha, 4);

  display: inline-flex;
  align-items: center;
  justify-content: start;

  appearance: none;
  border: 0;
  background-color: inherit;

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
    gap: space(6);
  }

  &:deep(svg) {
    width: 1em;
    height: 1em;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    background: color(theme, neutral, dark-alpha, 4);
  }

  &.is-active {
    background: color(theme, primary, dark, 5);
  }

  @each $tone, $palette in $button-tones {
    &.tone-#{$tone} {
      color: color(theme, #{$palette}, dark-alpha, 11);

      &:focus,
      &:focus-visible {
        background: color(theme, #{$palette}, dark-alpha, 4);
      }
    }
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
