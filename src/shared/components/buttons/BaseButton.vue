<template>
  <button
    :class="[
      `tone-${tone}`,
      `variant-${variant}`,
      `size-${size}`,
      `radius-${radius}`,
      loading && 'is-loading',
    ]"
    :disabled="disabled || loading"
    :type="type"
  >
    <span class="button__content">
      <slot></slot>
    </span>

    <span v-if="loading" class="button__loading" aria-hidden="true">
      <Loader2 />
    </span>
  </button>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { Variant, Tone, Size, Radius } from './types'

type Props = {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  variant?: Variant
  tone?: Tone
  size?: Size
  radius?: Radius
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  loading: false,
  variant: 'solid',
  tone: 'primary',
  size: 'md',
  radius: 'sm',
})
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
    line-height: ui-line-height(tight),
  ),
  md: (
    height: space(8),
    padding-x: space(3),
    font-size: font-size(base),
    icon: 1em,
    line-height: ui-line-height(normal),
  ),
  lg: (
    height: space(10),
    padding-x: space(4),
    font-size: font-size(h5),
    icon: 1.1em,
    line-height: ui-line-height(normal),
  ),
  xl: (
    height: space(12),
    padding-x: space(5),
    font-size: font-size(h4),
    icon: 1.15em,
    line-height: ui-line-height(relaxed),
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
  display: inline-flex;
  align-items: center;
  justify-content: center;

  position: relative;

  height: space(8);
  padding: 0 space(3);
  border-radius: var(--btn-radius, border-radius(sm));

  line-height: ui-line-height(normal);
  font-weight: font-weight(semibold);
  font-size: font-size(base);
  white-space: nowrap;

  appearance: none;
  border: 0;
  background: transparent;

  color: var(--btn-fg, color(text, primary));
  background-color: var(--btn-bg, transparent);
  border: var(--btn-border, 0);

  cursor: pointer;
  user-select: none;

  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 100ms ease;

  & .button__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;

    transition: opacity 150ms ease;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.4;
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
    line-height: deep-get($values, line-height);

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
    --btn-color-8: #{color(theme, #{$palette}, dark, 8)};
    --btn-color-9: #{color(theme, #{$palette}, dark, 9)};
    --btn-color-10: #{color(theme, #{$palette}, dark, 10)};
    --btn-color-11: #{color(theme, #{$palette}, dark, 11)};

    --btn-a1: #{color(theme, #{$palette}, dark-alpha, 1)};
    --btn-a2: #{color(theme, #{$palette}, dark-alpha, 2)};

    --btn-a3: #{color(theme, #{$palette}, dark-alpha, 3)};
    --btn-a4: #{color(theme, #{$palette}, dark-alpha, 4)};
    --btn-a5: #{color(theme, #{$palette}, dark-alpha, 5)};

    --btn-a6: #{color(theme, #{$palette}, dark-alpha, 6)};
    --btn-a7: #{color(theme, #{$palette}, dark-alpha, 7)};

    --btn-text: #{color(theme, #{$palette}, dark-alpha, 11)};

    --btn-text-light: #{palette(gray, dark, 12)};
    --btn-text-dark: #{palette(gray, light-alpha, 12)};

    --btn-shadow: inset 0 0 0 1px var(--btn-a6);

    --btn-focus-ring: #{color(theme, #{$palette}, dark-alpha, 6)};
  }
}

.variant-solid {
  --btn-bg: var(--btn-color-9);
  --btn-fg: var(--btn-text-light);

  &.tone-primary {
    --btn-fg: var(--btn-text-#{$color-primary-accent});
  }

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

  &:disabled {
    --btn-fg: #{color(theme, neutral, dark-alpha, 11)};
    --btn-bg: #{color(theme, neutral, dark-alpha, 6)};
  }
}

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

  &:disabled {
    --btn-fg: #{color(theme, neutral, dark-alpha, 11)};
    --btn-bg: #{color(theme, neutral, dark-alpha, 2)};
  }
}

.variant-surface {
  --btn-bg: var(--btn-a2);
  --btn-fg: var(--btn-text);

  box-shadow: inset 0 0 0 1px var(--btn-a6);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a3);

      box-shadow: inset 0 0 0 1px var(--btn-a7);
    }
  }

  &:active {
    --btn-bg: var(--btn-a4);

    box-shadow: inset 0 0 0 1px var(--btn-color-8);
  }

  &:disabled {
    --btn-fg: #{color(theme, neutral, dark-alpha, 11)};
    --btn-bg: #{color(theme, neutral, dark-alpha, 2)};

    box-shadow: inset 0 0 0 1px #{color(theme, neutral, dark-alpha, 6)};
  }
}

.variant-outline {
  --btn-bg: transparent;
  --btn-fg: var(--btn-text);

  box-shadow: inset 0 0 0 1px var(--btn-color-8);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a3);
    }
  }

  &:active {
    --btn-bg: var(--btn-a4);
  }

  &:disabled {
    --btn-fg: #{color(theme, neutral, dark-alpha, 11)};

    box-shadow: inset 0 0 0 1px #{color(theme, neutral, dark, 8)};
  }
}

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

  &:disabled {
    --btn-fg: #{color(theme, neutral, dark-alpha, 11)};
  }
}

.is-loading {
  .button__content {
    opacity: 0;
  }
}

.button__loading {
  position: absolute;
  inset: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:deep(svg) {
    animation: spin 1.3s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
