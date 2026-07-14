<template>
  <ButtonLink
    class="link-icon__button"
    :class="[size && `link-icon-btn-size-${size}`]"
    :to="to"
    :href="href"
    :external="external"
    :target="target"
    :rel="rel"
    :variant="variant"
    :tone="tone"
    :size="size"
    :radius="radius"
    :aria-label="label"
  >
    <component :is="icon" aria-hidden="true" :strokeWidth="2.75" />
  </ButtonLink>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import type { Variant, Tone, Size, Radius } from '@/library/types/components/buttons'
import ButtonLink from '@/shared/components/links/ButtonLink.vue'

type Props = {
  icon: Component
  label?: string
  to?: RouteLocationRaw
  href?: string
  external?: boolean
  target?: string
  rel?: string
  variant?: Variant
  tone?: Tone
  size?: Size
  radius?: Radius
}

withDefaults(defineProps<Props>(), {
  external: false,
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

.link-icon__button {
  padding: 0;
  aspect-ratio: 1 / 1;

  & :deep(.button__content) {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
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
