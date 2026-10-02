<template>
  <RouterLink
    :to="href"
    :class="[`tone-${tone}`, `underline-${underline}`]"
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

import type { Tone } from './links'

withDefaults(
  defineProps<{
    href: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
    tone?: Tone
    external?: boolean
    underline?: 'always' | 'hover'
  }>(),
  {
    tone: 'primary',
    underline: 'always',
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
  font-weight: font-weight(semibold);

  // FOCUS
  &:focus-visible {
    outline: none;
  }

  // UNDERLINE
  &.underline-always {
    text-decoration: underline;
  }

  &.underline-hover {
    text-decoration: none;

    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
      }
    }
  }

  // TONE
  &.tone-inherit {
    --link-fg: inherit;
  }

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
