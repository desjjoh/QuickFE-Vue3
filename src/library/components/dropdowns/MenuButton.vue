<template>
  <button
    ref="el"
    class="menu-item"
    :class="[active && 'is-active', tone && `tone-${tone}`]"
    type="button"
    role="menuitem"
    :disabled="disabled"
    :aria-disabled="disabled ? 'true' : undefined"
    @pointermove="onPointerMove"
  >
    <span class="button__content">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { inject, type Ref, ref } from 'vue'
import {
  DropdownMenuContextKey,
  type DropdownMenuContext,
  type Tone,
} from '@/library/types/components/dropdowns'
import { assertDefined } from '@/helpers/assert'

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
  if (props.disabled || !el.value) return

  context?.requestItemFocus(el.value)
}
</script>
