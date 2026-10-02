<template>
  <button
    class="button-link"
    :class="[`tone-${tone}`, `underline-${underline}`]"
    :type="type"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import type { ButtonLinkProps } from './buttons'

withDefaults(defineProps<ButtonLinkProps>(), {
  tone: 'primary',
  type: 'button',
  disabled: false,
  underline: 'always',
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
  text-underline-offset: 0.15em;
  cursor: pointer;
  font-weight: font-weight(semibold);

  &:focus-visible {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: default;
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
