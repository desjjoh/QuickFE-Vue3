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

import type { Tone } from './types'

withDefaults(
  defineProps<{
    href: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
    tone?: Tone
    external?: boolean
  }>(),
  {
    tone: 'primary',
    external: false,
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
  font: inherit;
  color: var(--link-fg, currentColor);
  text-underline-offset: 0.15em;

  cursor: pointer;

  transition: color 0.3s ease-in-out;

  &:focus-visible {
    outline: none;
  }
}

@each $tone, $palette in $link-tones {
  a.tone-#{$tone} {
    --link-fg: #{color(theme, #{$palette}, dark, 11)};
  }

  @media (hover: hover) {
    a.tone-#{$tone}:hover,
    a.tone-#{$tone}:focus-visible,
    a.tone-#{$tone}:active {
      --link-fg: #{color(theme, #{$palette}, dark, 12)};
    }
  }
}
</style>
