<template>
  <span
    :class="[
      'badge',
      `tone-${tone}`,
      `variant-${variant}`,
      `size-${size}`,
      pill && 'radius-pill',
      truncate && 'truncate',
    ]"
  >
    <component
      :is="icon"
      v-if="icon && iconPosition === 'start'"
      class="badge__icon badge__icon--start"
      aria-hidden="true"
      :stroke-width="iconStrokeWidth"
    />

    <span class="badge__label">
      <slot></slot>
    </span>

    <component
      :is="icon"
      v-if="icon && iconPosition === 'end'"
      class="badge__icon badge__icon--end"
      aria-hidden="true"
      :stroke-width="iconStrokeWidth"
    />
  </span>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

import type { Variant, Tone, Size } from '@/library/types/components/badges'

type IconPosition = 'start' | 'end'

withDefaults(
  defineProps<{
    variant?: Variant
    tone?: Tone
    size?: Size
    pill?: boolean
    truncate?: boolean
    icon?: Component
    iconPosition?: IconPosition
    iconStrokeWidth?: number
  }>(),
  {
    variant: 'solid',
    tone: 'primary',
    size: 'md',
    truncate: false,
    icon: undefined,
    iconPosition: 'start',
    iconStrokeWidth: 3,
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
    gap: space(1),
    icon: 0.95em,
    line-height: ui-line-height(tight),
  ),
  md: (
    font-size: 0.9em,
    padding-x: space(2),
    padding-y: space(0.75),
    gap: space(1.5),
    icon: 1em,
    line-height: ui-line-height(tight),
  ),
  lg: (
    font-size: 1em,
    padding-x: space(2.5),
    padding-y: space(1),
    gap: space(1.5),
    icon: 1.05em,
    line-height: ui-line-height(tight),
  ),
);

.badge {
  --badge-fg: #{color(text, primary)};
  --badge-bg: transparent;
  --badge-radius: #{border-radius(sm)};
  --badge-border: none;

  --badge-font-size: 0.9em;
  --badge-line-height: #{ui-line-height(tight)};
  --badge-padding-x: #{space(2)};
  --badge-padding-y: #{space(0.75)};
  --badge-gap: #{space(1.5)};
  --badge-icon-size: 1em;

  display: inline-block;

  min-width: 0;
  max-width: 100%;

  padding-block: var(--badge-padding-y);
  padding-inline: var(--badge-padding-x);

  overflow: visible;

  font-family: inherit;
  font-weight: font-weight(medium);
  font-size: var(--badge-font-size);
  line-height: var(--badge-line-height);
  vertical-align: middle;

  color: var(--badge-fg);
  background-color: var(--badge-bg);
  border-radius: var(--badge-radius);
  border: var(--badge-border);

  &.radius-pill {
    --badge-radius: #{border-radius(pill)};
  }

  &.truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  @each $size, $value in $badge-sizes {
    &.size-#{$size} {
      --badge-font-size: #{deep-get($value, font-size)};
      --badge-line-height: #{deep-get($value, line-height)};
      --badge-padding-x: #{deep-get($value, padding-x)};
      --badge-padding-y: #{deep-get($value, padding-y)};
      --badge-gap: #{deep-get($value, gap)};
      --badge-icon-size: #{deep-get($value, icon)};
    }
  }

  @each $tone, $palette in $badge-tones {
    &.tone-#{$tone} {
      --badge-solid-bg: #{color(theme, #{$palette}, theme, 9)};
      --badge-outline-color: #{color(theme, #{$palette}, theme, 8)};

      --badge-soft-bg: #{color(theme, #{$palette}, theme-alpha, 3)};
      --badge-surface-bg: #{color(theme, #{$palette}, theme-alpha, 2)};
      --badge-surface-border: #{color(theme, #{$palette}, theme-alpha, 6)};

      --badge-text: #{color(theme, #{$palette}, theme, 11)};
      --badge-solid-fg: #{color(theme, #{$palette}, solid-fg)};
    }
  }

  &.variant-solid {
    --badge-bg: var(--badge-solid-bg);
    --badge-fg: var(--badge-solid-fg);
  }

  &.variant-soft {
    --badge-bg: var(--badge-soft-bg);
    --badge-fg: var(--badge-text);
  }

  &.variant-surface {
    --badge-bg: var(--badge-surface-bg);
    --badge-fg: var(--badge-text);
    --badge-border: 1px solid var(--badge-surface-border);
  }

  &.variant-outline {
    --badge-bg: transparent;
    --badge-fg: var(--badge-text);
    --badge-border: 1px solid var(--badge-outline-color);
  }
}

.badge__icon {
  display: inline-block;

  width: var(--badge-icon-size);
  height: var(--badge-icon-size);

  color: currentColor;

  vertical-align: -0.18em;
}

.badge__icon--start {
  margin-inline-end: var(--badge-gap);
}

.badge__icon--end {
  margin-inline-start: var(--badge-gap);
}

.badge__label {
  display: inline;

  min-width: 0;
  max-width: 100%;
}
</style>
