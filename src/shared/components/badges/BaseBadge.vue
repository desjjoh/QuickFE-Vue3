<template>
  <span :class="[`tone-${tone}`, `variant-${variant}`]"><slot></slot></span>
</template>

<script setup lang="ts">
import type { Variant, Tone, Size, Radius } from './types'

withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    variant?: Variant
    tone?: Tone
    size?: Size
    radius?: Radius
  }>(),
  {
    type: 'button',
    disabled: false,
    variant: 'solid',
    tone: 'primary',
    size: 'md',
    radius: 'sm',
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
  display: inline-flex;

  font-size: 0.875em;
  font-weight: font-weight(medium);

  color: var(--badge-fg, color(text, primary));
  background-color: var(--badge-bg, transparent);

  padding: space(0.5) space(1.5);
  border-radius: var(--badge-radius, border-radius(sm));

  line-height: ui-line-height(tight);
  font-family: inherit;
}

@each $tone, $palette in $badge-tones {
  .tone-#{$tone} {
    /* Solid backgrounds */
    --badge-color-8: #{color(theme, #{$palette}, dark, 8)};
    --badge-color-9: #{color(theme, #{$palette}, dark, 9)};

    /* Alpha overlays */
    --badge-a2: #{color(theme, #{$palette}, dark-alpha, 2)};
    --badge-a3: #{color(theme, #{$palette}, dark-alpha, 3)};
    --badge-a6: #{color(theme, #{$palette}, dark-alpha, 6)};

    /* Text tone (readable accent text) */
    --badge-text: #{color(theme, #{$palette}, dark, 11)};

    --badge-text-primary: #{color(theme, neutral, #{$primary-accent}-alpha, 12)};

    --badge-text-light: #{palette(white, 12)};
    --badge-text-dark: #{palette(gray, light-alpha, 12)};

    --badge-shadow: inset 0 0 0 1px var(--btn-a6);
  }
}

.variant-solid {
  --badge-bg: var(--badge-color-9);
  --badge-fg: var(--badge-text-light);

  &.tone-primary {
    --btn-fg: var(--btn-text-#{$primary-accent});
  }

  // &.tone-success,
  &.tone-warning,
  &.tone-info {
    --badge-fg: var(--badge-text-dark);
  }
}

.variant-soft {
  --badge-bg: var(--badge-a3);
  --badge-fg: var(--badge-text);
}

.variant-surface {
  --badge-bg: var(--badge-a2);
  --badge-fg: var(--badge-text);

  box-shadow: inset 0 0 0 1px var(--badge-a6);
}

.variant-outline {
  --badge-bg: transparent;
  --badge-fg: var(--badge-text);

  box-shadow: inset 0 0 0 1px var(--badge-color-8);
}
</style>
