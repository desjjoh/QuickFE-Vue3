<template>
  <span :class="[`tone-${tone}`, `variant-${variant}`, `size-${size}`, pill && `radius-pill`]">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import type { Variant, Tone, Size } from './types'

withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    variant?: Variant
    tone?: Tone
    size?: Size
    pill?: boolean
  }>(),
  {
    type: 'button',
    disabled: false,
    variant: 'solid',
    tone: 'primary',
    size: 'md',
  },
)
</script>

<style scoped lang="scss">
$badge-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

$badge-sizes: (
  sm: (
    font-size: 0.857em,
    padding-x: space(1.5),
    padding-y: space(0.5),
    line-height: ui-line-height(tight),
  ),
  md: (
    font-size: 0.9em,
    padding-x: space(2),
    padding-y: space(0.75),
    line-height: ui-line-height(tight),
  ),
  lg: (
    font-size: 1em,
    padding-x: space(2.5),
    padding-y: space(1),
    line-height: ui-line-height(tight),
  ),
);

span {
  --badge-fg: #{color(text, primary)};
  --badge-bg: transparent;
  --badge-radius: #{border-radius(sm)};
  --badge-shadow: none;

  --badge-font-size: 0.9em;
  --badge-line-height: #{ui-line-height(tight)};
  --badge-padding-x: #{space(2)};
  --badge-padding-y: #{space(0.75)};

  // BASE
  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-family: inherit;
  font-weight: font-weight(medium);
  font-size: var(--badge-font-size);
  line-height: var(--badge-line-height);

  padding-block: var(--badge-padding-y);
  padding-inline: var(--badge-padding-x);

  color: var(--badge-fg);
  background-color: var(--badge-bg);
  border-radius: var(--badge-radius);
  box-shadow: var(--badge-shadow);

  // BORDER RADIUS
  &.radius-pill {
    --badge-radius: #{border-radius(pill)};
  }

  // SIZE
  @each $size, $value in $badge-sizes {
    &.size-#{$size} {
      --badge-font-size: #{deep-get($value, font-size)};
      --badge-line-height: #{deep-get($value, line-height)};
      --badge-padding-x: #{deep-get($value, padding-x)};
      --badge-padding-y: #{deep-get($value, padding-y)};
    }
  }

  // TONE
  @each $tone, $palette in $badge-tones {
    &.tone-#{$tone} {
      --badge-solid-bg: #{color(theme, #{$palette}, dark, 9)};
      --badge-outline-color: #{color(theme, #{$palette}, dark, 8)};

      --badge-soft-bg: #{color(theme, #{$palette}, dark-alpha, 3)};
      --badge-surface-bg: #{color(theme, #{$palette}, dark-alpha, 2)};
      --badge-surface-border: #{color(theme, #{$palette}, dark-alpha, 6)};

      --badge-text: #{color(theme, #{$palette}, dark, 11)};

      --badge-text-light: #{palette(gray, dark-alpha, 12)};
      --badge-text-dark: #{palette(gray, light-alpha, 12)};
    }
  }

  // VARIANTS (SOLID)
  &.variant-solid {
    --badge-bg: var(--badge-solid-bg);
    --badge-fg: var(--badge-text-light);

    &.tone-primary {
      --badge-fg: var(--badge-text-#{$color-primary-accent});
    }

    &.tone-warning,
    &.tone-info {
      --badge-fg: var(--badge-text-dark);
    }
  }

  // VARIANTS (SOFT)
  &.variant-soft {
    --badge-bg: var(--badge-soft-bg);
    --badge-fg: var(--badge-text);
  }

  // VARIANTS (SURFACE)
  &.variant-surface {
    --badge-bg: var(--badge-surface-bg);
    --badge-fg: var(--badge-text);
    --badge-shadow: inset 0 0 0 1px var(--badge-surface-border);
  }

  // VARIANTS (OUTLINE)
  &.variant-outline {
    --badge-bg: transparent;
    --badge-fg: var(--badge-text);
    --badge-shadow: inset 0 0 0 1px var(--badge-outline-color);
  }
}
</style>
