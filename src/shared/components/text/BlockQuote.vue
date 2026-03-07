<template>
  <blockquote class="block__quote" :class="[`variant-${variant}`]" :cite="cite">
    <slot></slot>
  </blockquote>
</template>

<script setup lang="ts">
import type { Variant } from './types'

withDefaults(defineProps<{ cite?: string; variant?: Variant }>(), { variant: 'primary' })
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
  --border-color: #{color(theme, primary, dark-alpha, 6)};

  // BASE
  padding-left: space(3);
  border-left: solid space(1);

  border-color: var(--border-color);

  // VARIANT
  @each $variant, $palette in $quote-variants {
    &.variant-#{$variant} {
      --border-color: #{color(theme, $variant, dark-alpha, 6)};
    }
  }
}
</style>
