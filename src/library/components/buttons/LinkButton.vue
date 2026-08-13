<template>
  <button class="button-link" :class="[`tone-${tone}`]" :type="type" :disabled="disabled">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import type { ButtonLinkProps } from '@/library/types/components/buttons'

withDefaults(defineProps<ButtonLinkProps>(), {
  tone: 'primary',
  type: 'button',
  disabled: false,
})
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

.button-link {
  // BUTTON RESET
  display: inline;
  margin: 0;
  padding: 0;
  border: 0;
  appearance: none;
  background: transparent;
  vertical-align: baseline;
  text-align: inherit;

  // LINK BASE
  font: inherit;
  line-height: inherit;
  color: var(--link-fg, currentColor);
  text-decoration: underline;
  text-underline-offset: 0.15em;
  cursor: pointer;

  &:focus-visible {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: default;
  }

  @each $tone, $palette in $link-tones {
    &.tone-#{$tone} {
      --link-fg: #{color(theme, #{$palette}, theme, 11)};
      --link-hover-fg: #{color(theme, #{$palette}, theme, 12)};
    }

    @media (hover: hover) {
      &.tone-#{$tone}:hover,
      &.tone-#{$tone}:focus-visible,
      &.tone-#{$tone}:active {
        --link-fg: var(--link-hover-fg);
      }
    }
  }
}
</style>
