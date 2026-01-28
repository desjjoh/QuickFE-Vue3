<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="[`tone-${tone}`]"
  >
    <slot></slot>
  </a>
</template>

<script setup lang="ts">
import type { Tone } from './types'

withDefaults(
  defineProps<{
    href: string
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
    --link-fg: #{color(theme, #{$palette}, dark-alpha, 11)};
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
