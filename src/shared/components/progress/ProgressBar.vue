<template>
  <div
    class="progress-bar"
    :class="[`tone-${tone}`, `size-${size}`]"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="safeMax"
    :aria-valuenow="clampedValue"
    :aria-valuetext="`${percentage}%`"
  >
    <div class="progress-bar__track">
      <div class="progress-bar__fill" :style="{ width: `${percentage}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ProgressTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type ProgressSize = 'sm' | 'md' | 'lg'

type Props = {
  value: number
  max?: number
  tone?: ProgressTone
  size?: ProgressSize
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  tone: 'primary',
  size: 'md',
})

const safeMax = computed<number>(() => {
  return props.max > 0 ? props.max : 100
})

const clampedValue = computed<number>(() => {
  return Math.min(Math.max(props.value, 0), safeMax.value)
})

const percentage = computed<number>(() => {
  return Math.round((clampedValue.value / safeMax.value) * 100)
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

.progress-bar {
  --progress-track: #{color(theme, neutral, theme-alpha, 4)};
  --progress-fill: #{color(theme, primary, theme, 9)};
  --progress-height: #{space(2)};

  display: block;

  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.progress-bar__track {
  width: 100%;
  height: var(--progress-height);

  overflow: hidden;

  background-color: var(--progress-track);
  border-radius: border-radius(pill);
}

.progress-bar__fill {
  height: 100%;
  width: 0;

  background-color: var(--progress-fill);
  border-radius: inherit;
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
</style>
