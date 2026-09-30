<template>
  <button
    :class="[
      `tone-${tone}`,
      `variant-${variant}`,
      `size-${size}`,
      `radius-${radius}`,
      loading && 'is-loading',
    ]"
    :disabled="disabled || loading"
    :type="type"
  >
    <span class="button__content">
      <component
        :is="icon"
        v-if="icon && iconPosition === 'start'"
        class="button__icon button__icon--start"
        aria-hidden="true"
        :stroke-width="3"
      />

      <span class="button__label">
        <slot></slot>
      </span>

      <component
        :is="icon"
        v-if="icon && iconPosition === 'end'"
        class="button__icon button__icon--end"
        aria-hidden="true"
        :stroke-width="3"
      />
    </span>

    <span v-if="loading" class="button__loading" aria-hidden="true">
      <Loader2 />
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Loader2 } from 'lucide-vue-next'

import type { Variant, Tone, Size, Radius } from './buttons'

type Props = {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  variant?: Variant
  tone?: Tone
  size?: Size
  radius?: Radius
  icon?: Component
  iconPosition?: 'start' | 'end'
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  loading: false,
  variant: 'solid',
  tone: 'primary',
  size: 'md',
  radius: 'sm',
  icon: undefined,
  iconPosition: 'end',
})
</script>

<style scoped lang="scss">
@use '@/library/styles/components' as button;

button {
  @include button.interactive-control;
  @include button.states;
}

@include button.styles;

.is-loading .button__content {
  opacity: 0;
}

.button__loading {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:deep(svg) {
    width: var(--button-icon-size);
    height: var(--button-icon-size);
    animation: spin 1.6s linear infinite;
  }
}
</style>
