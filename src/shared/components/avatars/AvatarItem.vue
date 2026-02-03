<template>
  <span
    class="avatar__item"
    :class="[
      `size-${size}`,
      `radius-${radius}`,
      !src && `tone-${tone}`,
      !src && `variant-${variant}`,
    ]"
    role="img"
    :aria-label="alt"
  >
    <img v-if="src" :src="src" :alt="alt" @error="hasError = true" />
    <span v-else class="avatar__fallback">
      <slot v-if="hasFallbackSlot"></slot>
      <UserIcon v-else />
    </span>
  </span>
</template>

<script setup lang="ts">
import { UserIcon } from 'lucide-vue-next'
import { ref, useSlots } from 'vue'

import type { Props } from './types'

withDefaults(defineProps<Props>(), {
  size: 'md',
  radius: 'md',
  tone: 'primary',
  variant: 'solid',
})

const slots = useSlots()

const hasFallbackSlot = !!slots.default
const hasError = ref(false)
</script>

<style scoped lang="scss">
$avatar-tones: (
  primary: primary,
  neutral: neutral,
);

$avatar-sizes: (
  xs: space(6),
  sm: space(8),
  md: space(10),
  lg: space(12),
  xl: space(16),
  xxl: space(20),
  xxxl: space(24),
  mega: space(32),
);

$avatar-radius: (
  none: 0,
  xs: border-radius(xs),
  sm: border-radius(sm),
  md: border-radius(md),
  lg: border-radius(lg),
  xl: border-radius(xl),
  xxl: border-radius(xxl),
  full: border-radius(pill),
);

.avatar__item {
  display: inline-grid;
  place-items: center;

  overflow: hidden;
  user-select: none;
  flex-shrink: 0;

  overflow: hidden;
  user-select: none;
  flex-shrink: 0;

  &:deep(svg) {
    display: block;

    width: 1.3em;
    height: 1.3em;
  }

  & .avatar-fallback {
    display: grid;
    place-items: center;

    width: 100%;
    height: 100%;

    font-weight: font-weight(semibold);
    line-height: 1;
  }

  & img {
    width: 100%;
    height: 100%;

    object-fit: cover;
  }
}

@each $tone, $value in $avatar-tones {
  .tone-#{$tone} {
    --color-9: #{color(theme, #{$value}, dark, 9)};

    --color-a3: #{color(theme, #{$value}, dark-alpha, 3)};
    --color-a11: #{color(theme, #{$value}, dark-alpha, 11)};

    --text-light: #{palette(white, 12)};
    --text-dark: #{palette(gray, light-alpha, 12)};
  }
}

@each $size, $value in $avatar-sizes {
  .size-#{$size} {
    width: $value;
    height: $value;

    font-size: calc(#{$value} * 0.4);
  }
}

@each $radii, $value in $avatar-radius {
  .radius-#{$radii} {
    border-radius: $value;
  }
}

.variant-solid {
  background-color: var(--color-9);
  color: var(--text-light);

  &.tone-primary {
    color: var(--text-#{$color-primary-accent});
  }
}

.variant-soft {
  background-color: var(--color-a3);
  color: var(--color-a11);
}
</style>
