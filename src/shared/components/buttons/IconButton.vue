<template>
  <BaseButton
    class="icon__button"
    :class="[size && `icon-btn-size-${size}`]"
    :variant="variant"
    :tone="tone"
    :size="size"
    :radius="radius"
    :disabled="disabled"
    :loading="loading"
    :aria-label="label"
  >
    <component :is="icon" aria-hidden="true" :stroke-width="2.75" />
  </BaseButton>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import type { Variant, Tone, Size, Radius } from '@/library/types/components/buttons'

type Props = {
  icon: Component
  label?: string
  variant?: Variant
  tone?: Tone
  size?: Size
  radius?: Radius
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'solid',
  tone: 'primary',
  size: 'md',
  radius: 'sm',
})
</script>

<style scoped lang="scss">
$button-sizes: (
  sm: (
    icon: 0.875em,
  ),
  md: (
    icon: 1.1429em,
  ),
  lg: (
    icon: 1.25em,
  ),
  xl: (
    icon: 1.375em,
  ),
);

.icon__button {
  padding: 0;
  aspect-ratio: 1 / 1;

  &:deep(.button__content) {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    overflow: visible;
  }

  &:deep(.button__label) {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    line-height: 1;
  }

  &:deep(svg) {
    display: block;
  }

  @each $size, $values in $button-sizes {
    &.size-#{$size} {
      &:deep(svg) {
        width: deep-get($values, icon);
        height: deep-get($values, icon);
      }
    }
  }
}
</style>
