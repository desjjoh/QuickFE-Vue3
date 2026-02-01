<template>
  <span
    class="avatar__item"
    :class="[`size-${size}`, `radius-${radius}`, !src && `tone-${tone}`]"
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
import type { Radius, Size, Tone } from './types'

withDefaults(
  defineProps<{
    src?: string
    alt?: string
    size?: Size
    tone?: Tone
    radius?: Radius
  }>(),
  {
    size: 'md',
    radius: 'full',
    tone: 'primary',
  },
)

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

    font-size: 0.4em;
    font-weight: font-weight(semibold);
    line-height: 1;
  }

  & img {
    width: 100%;
    height: 100%;

    object-fit: cover;
  }
}

@each $size, $value in $avatar-sizes {
  .size-#{$size} {
    width: $value;
    height: $value;
  }
}

@each $tone, $value in $avatar-tones {
  .tone-#{$tone} {
    background: #{color(theme, #{$value}, dark, 3)};
    color: #{color(theme, #{$value}, dark-alpha, 11)};
  }
}
</style>
