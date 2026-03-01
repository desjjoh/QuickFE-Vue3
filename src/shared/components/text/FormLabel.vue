<template>
  <label :for="props.for" :class="[size && `size-${size}`]">
    <slot></slot>
  </label>
</template>

<script setup lang="ts">
import type { Size } from './types'

const props = withDefaults(defineProps<{ for: string; size?: Size }>(), {})
</script>

<style scoped lang="scss">
$text-sizes: (
  h1: font-size(h1),
  h2: font-size(h2),
  h3: font-size(h3),
  h4: font-size(h4),
  h5: font-size(h5),
  base: font-size(base),
  sm: font-size(sm),
);

label {
  cursor: pointer;

  color: color(text, primary);
  font-weight: font-weight(medium);

  @each $size, $value in $text-sizes {
    &.size-#{$size} {
      font-size: #{$value};
    }
  }
}
</style>
