<template>
  <div
    class="progress-loader"
    :class="[`tone-${tone}`, `size-${size}`]"
    role="progressbar"
    aria-valuetext="Loading"
  >
    <div class="progress-loader__track">
      <div class="progress-loader__fill"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ProgressTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type ProgressSize = 'sm' | 'md' | 'lg'

type Props = {
  tone?: ProgressTone
  size?: ProgressSize
}

withDefaults(defineProps<Props>(), {
  tone: 'primary',
  size: 'md',
})
</script>

<style scoped lang="scss">
$progress-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

$progress-sizes: (
  sm: space(1),
  md: space(2),
  lg: space(3),
);

.progress-loader {
  --progress-track: #{color(theme, neutral, theme-alpha, 4)};
  --progress-fill: #{color(theme, primary, theme, 9)};
  --progress-height: #{space(2)};

  display: block;

  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.progress-loader__track {
  position: relative;

  width: 100%;
  height: var(--progress-height);

  overflow: hidden;

  background-color: var(--progress-track);
  border-radius: border-radius(pill);
}

.progress-loader__fill {
  position: absolute;
  inset-block: 0;
  left: 0;

  width: 40%;

  background-color: var(--progress-fill);
  border-radius: inherit;

  animation: progress-loader-slide 1.25s ease-in-out infinite;
}

@each $tone, $palette in $progress-tones {
  .tone-#{$tone} {
    --progress-fill: #{color(theme, #{$palette}, theme, 9)};
    --progress-track: #{color(theme, #{$palette}, theme-alpha, 3)};
  }
}

@each $size, $height in $progress-sizes {
  .size-#{$size} {
    --progress-height: #{$height};
  }
}

@keyframes progress-loader-slide {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(280%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress-loader__fill {
    width: 100%;
    animation: none;
  }
}
</style>
