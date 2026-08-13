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
      <component
        :is="icon"
        v-if="icon && iconPosition === 'start'"
        class="button__icon button__icon--start"
        aria-hidden="true"
        :stroke-width="3"
      />

      <span class="button__label">
        <slot></slot>
      </span>

      <component
        :is="icon"
        v-if="icon && iconPosition === 'end'"
        class="button__icon button__icon--end"
        aria-hidden="true"
        :stroke-width="3"
      />
    </span>

    <span v-if="loading" class="button__loading" aria-hidden="true">
      <Loader2 />
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Loader2 } from 'lucide-vue-next'

import type { Variant, Tone, Size, Radius } from '@/library/types/components/buttons'

type Props = {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  variant?: Variant
  tone?: Tone
  size?: Size
  radius?: Radius
  icon?: Component
  iconPosition?: 'start' | 'end'
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  loading: false,
  variant: 'solid',
  tone: 'primary',
  size: 'md',
  radius: 'sm',
  icon: undefined,
  iconPosition: 'end',
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
    gap: space(1.5),
  ),
  md: (
    height: space(8),
    padding-x: space(3),
    font-size: font-size(base),
    icon: 1em,
    line-height: ui-line-height(normal),
    gap: space(2),
  ),
  lg: (
    height: space(10),
    padding-x: space(4),
    font-size: font-size(h5),
    icon: 1.1em,
    line-height: ui-line-height(normal),
    gap: space(2),
  ),
  xl: (
    height: space(12),
    padding-x: space(5),
    font-size: font-size(h4),
    icon: 1.15em,
    line-height: ui-line-height(relaxed),
    gap: space(2.5),
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
  --button-icon-size: 1em;
  --button-icon-gap: #{space(2)};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  position: relative;

  min-width: 0;
  max-width: 100%;
  height: space(8);
  padding: 0 space(3);
  border-radius: var(--btn-radius, border-radius(sm));

  overflow: hidden;

  font: inherit;
  line-height: ui-line-height(normal);
  font-weight: font-weight(semibold);
  font-size: font-size(base);
  white-space: nowrap;
  text-align: center;

  appearance: none;
  border: var(--btn-border, 0);
  background: transparent;

  color: var(--btn-fg, color(text, primary));
  background-color: var(--btn-bg, transparent);

  cursor: pointer;
  user-select: none;

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px var(--btn-a2),
      0 0 0 3px var(--btn-focus-ring),
      0 0 8px 2px var(--btn-focus-ring);
  }
}

.button__content {
  display: inline-block;

  min-width: 0;
  max-width: 100%;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.button__label {
  display: inline;

  min-width: 0;
  max-width: 100%;
}

.button__icon {
  display: inline-block;

  width: var(--button-icon-size);
  height: var(--button-icon-size);

  color: currentColor;

  vertical-align: -0.18em;
}

.button__icon--start {
  margin-inline-end: var(--button-icon-gap);
}

.button__icon--end {
  margin-inline-start: var(--button-icon-gap);
}

// SIZE
@each $size, $values in $button-sizes {
  .size-#{$size} {
    --button-icon-size: #{deep-get($values, icon)};
    --button-icon-gap: #{deep-get($values, gap)};

    height: deep-get($values, height);
    padding: 0 deep-get($values, padding-x);
    font-size: deep-get($values, font-size);
    line-height: deep-get($values, line-height);
  }
}

// BORDER RADIUS
@each $radius, $value in $button-radius {
  .radius-#{$radius} {
    --btn-radius: #{$value};
  }
}

// TONE
@each $tone, $palette in $button-tones {
  .tone-#{$tone} {
    --btn-color-8: #{color(theme, #{$palette}, theme, 8)};
    --btn-color-9: #{color(theme, #{$palette}, theme, 9)};
    --btn-color-10: #{color(theme, #{$palette}, theme, 10)};
    --btn-color-11: #{color(theme, #{$palette}, theme, 11)};

    --btn-a1: #{color(theme, #{$palette}, theme-alpha, 1)};
    --btn-a2: #{color(theme, #{$palette}, theme-alpha, 2)};

    --btn-a3: #{color(theme, #{$palette}, theme-alpha, 3)};
    --btn-a4: #{color(theme, #{$palette}, theme-alpha, 4)};
    --btn-a5: #{color(theme, #{$palette}, theme-alpha, 5)};

    --btn-a6: #{color(theme, #{$palette}, theme-alpha, 6)};
    --btn-a7: #{color(theme, #{$palette}, theme-alpha, 7)};

    --btn-text: #{color(theme, #{$palette}, theme-alpha, 11)};
    --btn-solid-fg: #{color(theme, #{$palette}, solid-fg)};

    --btn-focus-ring: #{color(theme, #{$palette}, theme-alpha, 6)};
  }
}

// VARIANTS (SOLID)
.variant-solid {
  --btn-bg: var(--btn-color-9);
  --btn-fg: var(--btn-solid-fg);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-color-10);
    }
  }

  &:active {
    --btn-bg: var(--btn-color-11);
  }

  &:disabled {
    --btn-fg: #{color(theme, neutral, theme-alpha, 11)};
    --btn-bg: #{color(theme, neutral, theme-alpha, 6)};
  }
}

// VARIANTS (SOFT)
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
    --btn-fg: #{color(theme, neutral, theme-alpha, 11)};
    --btn-bg: #{color(theme, neutral, theme-alpha, 2)};
  }
}

// VARIANTS (SURFACE)
.variant-surface {
  --btn-bg: var(--btn-a2);
  --btn-fg: var(--btn-text);
  --btn-border: 1px solid var(--btn-a6);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a3);
      --btn-border: 1px solid var(--btn-a7);
    }
  }

  &:active {
    --btn-bg: var(--btn-a4);
    --btn-border: 1px solid var(--btn-color-8);
  }

  &:disabled {
    --btn-fg: #{color(theme, neutral, theme-alpha, 11)};
    --btn-bg: #{color(theme, neutral, theme-alpha, 2)};
    --btn-border: 1px solid #{color(theme, neutral, theme-alpha, 6)};
  }
}

// VARIANTS (OUTLINE)
.variant-outline {
  --btn-bg: transparent;
  --btn-fg: var(--btn-text);
  --btn-border: 1px solid var(--btn-color-8);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a3);
    }
  }

  &:active {
    --btn-bg: var(--btn-a4);
  }

  &:disabled {
    --btn-fg: #{color(theme, neutral, theme-alpha, 11)};
    --btn-border: 1px solid #{color(theme, neutral, theme, 8)};
  }
}

// VARIANTS (GHOST)
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
    --btn-fg: #{color(theme, neutral, theme-alpha, 11)};
  }
}

// LOADING STATE
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
    width: var(--button-icon-size);
    height: var(--button-icon-size);

    animation: spin 1.6s linear infinite;
  }
}
</style>
