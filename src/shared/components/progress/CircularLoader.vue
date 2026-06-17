<template>
  <div
    class="circular-loader"
    :class="[`tone-${tone}`, presetSizeClass]"
    :style="loaderStyle"
    role="progressbar"
    :aria-valuetext="label"
  >
    <svg class="circular-loader__svg" viewBox="0 0 50 50" aria-hidden="true">
      <circle class="circular-loader__track" cx="25" cy="25" r="20" fill="none" />
      <circle class="circular-loader__fill" cx="25" cy="25" r="20" fill="none" pathLength="100" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type LoaderTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type LoaderPresetSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

type LoaderStyle = {
  '--loader-size'?: string
  '--loader-stroke'?: string
}

type Props = {
  tone?: LoaderTone
  size?: LoaderPresetSize | string
  strokeWidth?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'primary',
  size: 'md',
  label: 'Loading',
})

const presetSizes: LoaderPresetSize[] = ['sm', 'md', 'lg', 'xl', '2xl']

const isPresetSize = computed<boolean>(() => {
  return presetSizes.includes(props.size as LoaderPresetSize)
})

const presetSizeClass = computed<string>(() => {
  return isPresetSize.value ? `size-${props.size}` : ''
})

const loaderStyle = computed<LoaderStyle>(() => {
  return {
    '--loader-size': isPresetSize.value ? undefined : props.size,
    '--loader-stroke': props.strokeWidth,
  }
})
</script>

<style scoped lang="scss">
$loader-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

$loader-sizes: (
  sm: (
    size: space(4),
    stroke: 0.25rem,
  ),
  md: (
    size: space(5),
    stroke: 0.3rem,
  ),
  lg: (
    size: space(6),
    stroke: 0.35rem,
  ),
  xl: (
    size: space(10),
    stroke: 0.45rem,
  ),
  2xl: (
    size: space(16),
    stroke: 0.6rem,
  ),
);

.circular-loader {
  --loader-size: #{space(5)};
  --loader-stroke: 0.3rem;
  --loader-track: #{color(theme, neutral, theme-alpha, 4)};
  --loader-fill: #{color(theme, primary, theme, 9)};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;
  width: var(--loader-size);
  height: var(--loader-size);
}

.circular-loader__svg {
  display: block;

  width: 100%;
  height: 100%;

  animation: circular-loader-rotate 1s linear infinite;
}

.circular-loader__track,
.circular-loader__fill {
  stroke-width: var(--loader-stroke);
  transform-origin: center;
}

.circular-loader__track {
  stroke: var(--loader-track);
}

.circular-loader__fill {
  stroke: var(--loader-fill);
  stroke-linecap: round;
  stroke-dasharray: 36 100;
  stroke-dashoffset: 0;

  animation: circular-loader-dash 1.25s ease-in-out infinite;
}

@each $tone, $palette in $loader-tones {
  .tone-#{$tone} {
    --loader-fill: #{color(theme, #{$palette}, theme, 9)};
    --loader-track: #{color(theme, #{$palette}, theme-alpha, 3)};
  }
}

@each $size, $config in $loader-sizes {
  .size-#{$size} {
    --loader-size: #{token($config, size)};
    --loader-stroke: #{token($config, stroke)};
  }
}

@keyframes circular-loader-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes circular-loader-dash {
  0% {
    stroke-dasharray: 1 100;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 45 100;
    stroke-dashoffset: -15;
  }

  100% {
    stroke-dasharray: 45 100;
    stroke-dashoffset: -60;
  }
}

@media (prefers-reduced-motion: reduce) {
  .circular-loader__svg,
  .circular-loader__fill {
    animation: none;
  }

  .circular-loader__fill {
    stroke-dasharray: 70 100;
    stroke-dashoffset: 0;
  }
}
</style>
