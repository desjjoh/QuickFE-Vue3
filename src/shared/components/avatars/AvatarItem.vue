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
      <template v-if="props.fallback">
        {{ props.fallback }}
      </template>
      <UserIcon v-else />
    </span>
  </span>
</template>

<script setup lang="ts">
import { UserIcon } from 'lucide-vue-next'
import { ref } from 'vue'

import type { Props } from '@/shared/types/components/avatars'

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  radius: 'md',
  tone: 'primary',
  variant: 'solid',
})

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
  --avatar-size: #{space(10)};
  --avatar-radius: #{border-radius(none)};

  --avatar-bg: #{palette(gray, dark, 6)};
  --avatar-fg: #{palette(white, 12)};

  --avatar-bg-soft: #{palette(gray, dark-alpha, 3)};
  --avatar-fg-soft: #{palette(gray, light-alpha, 12)};

  // BASE
  display: inline-grid;
  place-items: center;

  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: var(--avatar-radius);

  overflow: hidden;
  user-select: none;
  flex-shrink: 0;

  font-size: calc(var(--avatar-size) * 0.4);

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

  // TONE
  @each $tone, $value in $avatar-tones {
    &.tone-#{$tone} {
      --avatar-bg: #{color(theme, #{$value}, dark, 9)};
      --avatar-fg: #{color(theme, #{$value}, dark-alpha, 12)};

      --avatar-text-light: #{palette(gray, dark-alpha, 12)};
      --avatar-text-dark: #{palette(gray, light-alpha, 12)};

      --avatar-bg-soft: #{color(theme, #{$value}, dark-alpha, 3)};
      --avatar-fg-soft: #{color(theme, #{$value}, dark-alpha, 11)};
    }
  }

  // SIZE
  @each $size, $value in $avatar-sizes {
    &.size-#{$size} {
      --avatar-size: #{$value};
    }
  }

  // BORDER RADIUS
  @each $radius, $value in $avatar-radius {
    &.radius-#{$radius} {
      --avatar-radius: #{$value};
    }
  }

  // VARIANTS (SOLID)
  &.variant-solid {
    background-color: var(--avatar-bg);
    color: var(--avatar-fg);

    &.tone-primary {
      color: var(--avatar-text-#{$color-primary-accent});
    }
  }

  // VARIANTS (SOFT)
  &.variant-soft {
    background-color: var(--avatar-bg-soft);
    color: var(--avatar-fg-soft);
  }
}
</style>
