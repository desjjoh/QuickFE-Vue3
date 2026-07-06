<template>
  <blockquote class="block__quote" :class="[`variant-${variant}`]">
    <slot></slot>
  </blockquote>
</template>

<script setup lang="ts">
import type { Variant } from '@/library/types/components/text'

withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'primary' })
</script>

<style scoped lang="scss">
$quote-variants: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.block__quote {
  padding: space(3);
  border-left: solid space(1);
  border-color: color(theme, primary, theme-alpha, 8);

  @each $variant, $palette in $quote-variants {
    &.variant-#{$variant} {
      color: color(theme, $variant, theme-alpha, 12);
      border-color: color(theme, $variant, theme-alpha, 8);
      background-color: color(theme, $variant, theme-alpha, 3);
    }
  }
}
</style>
