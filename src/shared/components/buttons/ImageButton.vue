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

import type { Radius, Size } from '@/library/types/components/avatars'
import type { Tone, Variant } from '@/library/types/components/buttons'

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
$image-button-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

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

$image-button-radius: (
  none: 0,
  xs: border-radius(xs),
  sm: border-radius(sm),
  md: border-radius(md),
  lg: border-radius(lg),
  xl: border-radius(xl),
  xxl: border-radius(xxl),
  full: border-radius(pill),
);

.image-button {
  --image-button-size: #{space(10)};
  --image-button-radius: #{border-radius(md)};
  --image-button-bg: transparent;
  --image-button-hover-bg: transparent;
  --image-button-fg: #{color(theme, neutral, theme-alpha, 11)};
  --image-button-border: 0;
  --image-button-focus-ring: #{color(theme, primary, theme-alpha, 6)};

  display: inline-grid;
  place-items: center;
  vertical-align: top;
  box-sizing: border-box;

  width: var(--image-button-size);
  height: var(--image-button-size);
  padding: 0;
  border: var(--image-button-border);
  border-radius: var(--image-button-radius);

  appearance: none;
  background-color: var(--image-button-bg);
  color: var(--image-button-fg);
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

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: var(--image-button-hover-bg);
      border: var(--image-button-hover-border, var(--image-button-border));
    }
  }

  &:active:not(:disabled) {
    background-color: var(--image-button-active-bg, var(--image-button-hover-bg));
    border: var(
      --image-button-active-border,
      var(--image-button-hover-border, var(--image-button-border))
    );
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px #{color(theme, neutral, theme-alpha, 2)},
      0 0 0 3px var(--image-button-focus-ring),
      0 0 8px 2px var(--image-button-focus-ring);
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
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

@each $tone, $palette in $image-button-tones {
  .tone-#{$tone} {
    --image-button-color-8: #{color(theme, #{$palette}, theme, 8)};
    --image-button-color-9: #{color(theme, #{$palette}, theme, 9)};
    --image-button-color-10: #{color(theme, #{$palette}, theme, 10)};
    --image-button-color-11: #{color(theme, #{$palette}, theme, 11)};
    --image-button-a2: #{color(theme, #{$palette}, theme-alpha, 2)};
    --image-button-a3: #{color(theme, #{$palette}, theme-alpha, 3)};
    --image-button-a4: #{color(theme, #{$palette}, theme-alpha, 4)};
    --image-button-a5: #{color(theme, #{$palette}, theme-alpha, 5)};
    --image-button-a6: #{color(theme, #{$palette}, theme-alpha, 6)};
    --image-button-a7: #{color(theme, #{$palette}, theme-alpha, 7)};
    --image-button-text: #{color(theme, #{$palette}, theme-alpha, 11)};
    --image-button-solid-fg: #{color(theme, #{$palette}, solid-fg)};
    --image-button-focus-ring: #{color(theme, #{$palette}, theme-alpha, 6)};
  }
}

.variant-solid {
  --image-button-bg: var(--image-button-color-9);
  --image-button-hover-bg: var(--image-button-color-10);
  --image-button-active-bg: var(--image-button-color-11);
  --image-button-fg: var(--image-button-solid-fg);
}

.variant-soft {
  --image-button-bg: var(--image-button-a3);
  --image-button-hover-bg: var(--image-button-a4);
  --image-button-active-bg: var(--image-button-a5);
  --image-button-fg: var(--image-button-text);
}

.variant-surface {
  --image-button-bg: var(--image-button-a2);
  --image-button-hover-bg: var(--image-button-a3);
  --image-button-active-bg: var(--image-button-a4);
  --image-button-border: 1px solid var(--image-button-a6);
  --image-button-hover-border: 1px solid var(--image-button-a7);
  --image-button-active-border: 1px solid var(--image-button-color-8);
  --image-button-fg: var(--image-button-text);
}

.variant-outline {
  --image-button-bg: transparent;
  --image-button-hover-bg: var(--image-button-a3);
  --image-button-active-bg: var(--image-button-a4);
  --image-button-border: 1px solid var(--image-button-color-8);
  --image-button-fg: var(--image-button-text);
}

.variant-ghost {
  --image-button-bg: transparent;
  --image-button-hover-bg: var(--image-button-a4);
  --image-button-active-bg: var(--image-button-a5);
  --image-button-fg: var(--image-button-text);
}

@each $size, $value in $image-button-sizes {
  .size-#{$size} {
    --image-button-size: #{$value};
  }
}

@each $radius, $value in $image-button-radius {
  .radius-#{$radius} {
    --image-button-radius: #{$value};
  }
}
</style>
