<template>
  <button
    class="image-button"
    :class="[
      `tone-${tone}`,
      `variant-${variant}`,
      `size-${size}`,
      `radius-${radius}`,
      disabled && 'is-disabled',
      loading && 'is-loading',
    ]"
    type="button"
    :disabled="disabled || loading"
    :aria-label="alt"
  >
    <img
      v-if="showImage && !hasError"
      class="image-button__image"
      :src="src"
      :alt="alt"
      @error="hasError = true"
    />

    <span v-else class="image-button__fallback" aria-hidden="true">
      <Loader2 v-if="loading" class="image-button__loader" />
      <slot v-else name="fallback">
        <span v-if="fallback" class="image-button__fallback-text">{{ fallback }}</span>
        <ImageIcon v-else />
      </slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ImageIcon, Loader2 } from 'lucide-vue-next'

import type { Radius, Size } from '../avatars/avatars'
import type { Tone, Variant } from './buttons'

type Props = {
  src?: string
  alt: string
  fallback?: string
  tone?: Tone
  variant?: Variant
  size?: Size
  radius?: Radius
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'primary',
  variant: 'solid',
  size: 'md',
  radius: 'md',
  disabled: false,
  loading: false,
})

const hasError = ref(false)
const showImage = computed(() => Boolean(props.src) && !props.loading && !hasError.value)

watch(
  () => props.src,
  () => {
    hasError.value = false
  },
)
</script>

<style scoped lang="scss">
@use '@/library/styles/components' as button;

$image-button-sizes: (
  xs: space(6),
  sm: space(8),
  md: space(10),
  lg: space(12),
  xl: space(16),
  xxl: space(20),
  xxxl: space(24),
  mega: space(32),
);

.image-button {
  --image-button-size: #{space(10)};

  @include button.states;

  display: inline-grid;
  place-items: center;
  vertical-align: top;
  box-sizing: border-box;
  width: var(--image-button-size);
  height: var(--image-button-size);
  padding: 0;
  border: var(--btn-border, 0);
  border-radius: var(--btn-radius, #{border-radius(md)});
  appearance: none;
  background-color: var(--btn-bg, transparent);
  color: var(--btn-fg, #{color(theme, neutral, theme-alpha, 11)});
  cursor: pointer;
  overflow: hidden;
  user-select: none;
  flex-shrink: 0;
  font: inherit;
  line-height: 1;
  font-size: calc(var(--image-button-size) * 0.4);

  &:deep(svg) {
    display: block;
    width: 1.3em;
    height: 1.3em;
  }
}

.image-button__image,
.image-button__fallback {
  width: 100%;
  height: 100%;
}
.image-button__image {
  object-fit: cover;
}
.image-button__fallback {
  display: grid;
  place-items: center;
  font-weight: font-weight(semibold);
  line-height: 1;
}
.image-button__fallback-text {
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.image-button__loader {
  animation: spin 1.6s linear infinite;
}

@include button.tones;
@include button.variants;
@include button.radii;

@each $size, $value in $image-button-sizes {
  .size-#{$size} {
    --image-button-size: #{$value};
  }
}
</style>
