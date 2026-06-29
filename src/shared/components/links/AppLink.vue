<template>
  <RouterLink
    :to="href"
    :class="[`tone-${tone}`]"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot></slot>
  </RouterLink>
</template>

<script setup lang="ts">
import {
  RouterLink,
  type RouteLocationAsPathGeneric,
  type RouteLocationAsRelativeGeneric,
} from 'vue-router'

import type { Tone } from '@/library/types/components/links'

withDefaults(
  defineProps<{
    href: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
    tone?: Tone
    external?: boolean
  }>(),
  {
    tone: 'primary',
  },
)
</script>

<style scoped lang="scss">
$link-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

a {
  // BASE
  font: inherit;
  color: var(--link-fg, currentColor);
  text-underline-offset: 0.15em;
  cursor: pointer;

  // FOCUS
  &:focus-visible {
    outline: none;
  }

  // TONE
  @each $tone, $palette in $link-tones {
    &.tone-#{$tone} {
      --link-fg: #{color(theme, #{$palette}, theme, 11)};
    }

    @media (hover: hover) {
      &.tone-#{$tone}:hover,
      &.tone-#{$tone}:focus-visible,
      &.tone-#{$tone}:active {
        --link-fg: #{color(theme, #{$palette}, theme, 12)};
      }
    }
  }
}
</style>
