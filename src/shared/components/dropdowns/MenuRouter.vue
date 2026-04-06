<template>
  <RouterLink :to="to" custom v-slot="{ href, navigate }">
    <a
      ref="el"
      class="menu-item"
      :class="[active && 'is-active', tone && `tone-${tone}`]"
      :href="href"
      role="menuitem"
      :aria-disabled="disabled ? 'true' : undefined"
      :tabindex="disabled ? -1 : undefined"
      @click="onClick($event, navigate)"
      @pointerleave="onPointerLeave"
      @pointermove="onPointerMove"
    >
      <span class="button__content">
        <slot></slot>
      </span>
    </a>
  </RouterLink>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { DropdownMenuContextKey, type DropdownMenuContext, type Tone } from './types'
import { assertDefined } from '@/helpers/assert'

const props = withDefaults(
  defineProps<{
    to: RouteLocationRaw
    active?: boolean
    disabled?: boolean
    tone?: Tone
  }>(),
  {
    disabled: false,
  },
)

const context: DropdownMenuContext | undefined = inject(DropdownMenuContextKey)
assertDefined(context, 'MenuItemLink must be used inside DropdownMenu')

const el: Ref<HTMLAnchorElement | null> = ref(null)

function onPointerMove(): void {
  if (props.disabled) return
  if (!el.value) return

  el.value.focus()
}

function onPointerLeave(): void {
  if (document.activeElement !== el.value) return
  context?.focusMenu()
}

function onClick(event: MouseEvent, navigate: (event?: MouseEvent) => void): void {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  navigate(event)
}
</script>
