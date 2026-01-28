<template>
  <button
    :class="[`tone-${tone}`, `variant-${variant}`, `size-${size}`, `radius-${radius}`]"
    :disabled="disabled"
    :type="type"
  >
    <slot></slot>
  </button>
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
$button-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

$button-sizes: (
  sm: (
    height: space(6),
    padding-x: space(2),
    font-size: font-size(sm),
    icon: 0.9em,
  ),
  md: (
    height: space(8),
    padding-x: space(3),
    font-size: font-size(base),
    icon: 1em,
  ),
  lg: (
    height: space(10),
    padding-x: space(4),
    font-size: font-size(h5),
    icon: 1.1em,
  ),
  xl: (
    height: space(12),
    padding-x: space(5),
    font-size: font-size(h4),
    icon: 1.15em,
  ),
);

$button-radius: (
  none: 0,
  xs: border-radius(xs),
  sm: border-radius(sm),
  md: border-radius(md),
  lg: border-radius(lg),
  xl: border-radius(xl),
  xxl: border-radius(xxl),
  full: border-radius(pill),
);

button {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: space(2);

  /* Geometry */
  height: space(8);
  padding: 0 space(3);
  border-radius: border-radius(sm);
  border-radius: var(--btn-radius, border-radius(sm));

  /* Typography */
  line-height: line-height(base);
  font-weight: font-weight(semibold);
  font-size: font-size(base);
  white-space: nowrap;

  /* Reset */
  appearance: none;
  border: 0;
  background: transparent;

  /* Default fallbacks */
  color: var(--btn-fg, color(text, primary));
  background-color: var(--btn-bg, transparent);
  border: var(--btn-border, 0);

  /* Interaction */
  cursor: pointer;
  user-select: none;

  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 100ms ease;

  &:deep(svg) {
    width: 1em;
    height: 1em;
  }

  &:disabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  &:focus-visible {
    outline: none;

    box-shadow:
      var(--btn-shadow, none),
      0 0 0 1px var(--btn-a2),
      0 0 0 3px var(--btn-focus-ring),
      0 0 8px 2px var(--btn-focus-ring);
  }
}

@each $size, $values in $button-sizes {
  .size-#{$size} {
    height: deep-get($values, height);
    padding: 0 deep-get($values, padding-x);
    font-size: deep-get($values, font-size);

    &:deep(svg) {
      width: deep-get($values, icon);
      height: deep-get($values, icon);
    }
  }
}

@each $radius, $value in $button-radius {
  .radius-#{$radius} {
    --btn-radius: #{$value};
  }
}

@each $tone, $palette in $button-tones {
  .tone-#{$tone} {
    /* Solid backgrounds */
    --btn-color-8: #{color(theme, #{$palette}, dark, 8)};
    --btn-color-9: #{color(theme, #{$palette}, dark, 9)};
    --btn-color-10: #{color(theme, #{$palette}, dark, 10)};
    --btn-color-11: #{color(theme, #{$palette}, dark, 11)};

    /* Alpha overlays */
    --btn-a1: #{color(theme, #{$palette}, dark-alpha, 1)};
    --btn-a2: #{color(theme, #{$palette}, dark-alpha, 2)};

    --btn-a3: #{color(theme, #{$palette}, dark-alpha, 3)};
    --btn-a4: #{color(theme, #{$palette}, dark-alpha, 4)};
    --btn-a5: #{color(theme, #{$palette}, dark-alpha, 5)};

    --btn-a6: #{color(theme, #{$palette}, dark-alpha, 6)};
    --btn-a7: #{color(theme, #{$palette}, dark-alpha, 7)};

    /* Text tone (readable accent text) */
    --btn-text: #{color(theme, #{$palette}, dark, 11)};

    --btn-text-light: #{color(theme, #{$palette}, light, 2)};
    --btn-text-dark: #{color(theme, #{$palette}, dark, 2)};

    --btn-shadow: inset 0 0 0 1px var(--btn-a6);

    /* Focus ring (outer glow) */
    --btn-focus-ring: #{color(theme, #{$palette}, dark-alpha, 6)};
  }
}

/* SOLID: loud, high emphasis */
.variant-solid {
  --btn-bg: var(--btn-color-9);
  --btn-fg: var(--btn-text-light);

  &.tone-warning,
  &.tone-info {
    --btn-fg: var(--btn-text-dark);
  }

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-color-10);
    }
  }

  &:active {
    --btn-bg: var(--btn-color-11);
  }
}

/* SOFT: tinted background, colored text */
.variant-soft {
  --btn-bg: var(--btn-a3);
  --btn-fg: var(--btn-text);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a4);
    }
  }

  &:active {
    --btn-bg: var(--btn-a5);
  }
}

/* SURFACE: neutral surface background with colored text */
.variant-surface {
  --btn-bg: var(--btn-a2);
  --btn-fg: var(--btn-text);

  box-shadow: var(--btn-shadow);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a3);
      // box-shadow: inset 0 0 0 1px var(--btn-a7);
      --btn-shadow: inset 0 0 0 1px var(--btn-a7);
    }
  }

  &:active {
    --btn-bg: var(--btn-a4);
    // box-shadow: inset 0 0 0 1px var(--btn-color-8);
    --btn-shadow: inset 0 0 0 1px var(--btn-color-8);
  }
}

/* GHOST: transparent, with alpha hover */
.variant-ghost {
  --btn-bg: transparent;
  --btn-fg: var(--btn-text);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a4);
    }
  }

  &:active {
    --btn-bg: var(--btn-a5);
  }
}
</style>
