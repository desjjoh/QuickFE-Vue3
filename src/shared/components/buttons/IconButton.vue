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
    <component :is="icon" aria-hidden="true" />
  </BaseButton>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import type { Variant, Tone, Size, Radius } from '@/shared/components/buttons/types'

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
  variant: 'ghost',
  tone: 'neutral',
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
  // BASE
  padding: 0;
  aspect-ratio: 1 / 1;

  & .button__content {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  // SIZE
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
