<template>
  <FlexBox direction="column" :gap="3" align-items="center">
    <div class="spinner" :style="spinnerStyle" role="status" :aria-label="$t('common.loading')">
      <div v-for="blade in 12" :key="blade" class="spinner-blade"></div>
    </div>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

type SpinnerStyle = {
  '--spinner-size': string
}

type Props = {
  size?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '3.6rem',
})

const spinnerStyle = computed<SpinnerStyle>(() => {
  return {
    '--spinner-size': props.size,
  }
})
</script>

<style scoped lang="scss">
.spinner {
  --spinner-size: 8rem;
  --spinner-color: #{color(theme, neutral, theme, 11)};

  position: relative;
  display: inline-block;

  width: 1em;
  height: 1em;

  font-size: var(--spinner-size);
}

.spinner-blade {
  position: absolute;
  left: 0.4629em;
  bottom: 0;

  width: 0.074em;
  height: 0.2777em;

  border-radius: 0.0555em;
  background-color: transparent;
  transform-origin: center -0.2222em;

  animation: spinner-fade 1s infinite linear;
}

.spinner-blade:nth-child(1) {
  animation-delay: 0s;
  transform: rotate(0deg);
}

.spinner-blade:nth-child(2) {
  animation-delay: 0.083s;
  transform: rotate(30deg);
}

.spinner-blade:nth-child(3) {
  animation-delay: 0.166s;
  transform: rotate(60deg);
}

.spinner-blade:nth-child(4) {
  animation-delay: 0.249s;
  transform: rotate(90deg);
}

.spinner-blade:nth-child(5) {
  animation-delay: 0.332s;
  transform: rotate(120deg);
}

.spinner-blade:nth-child(6) {
  animation-delay: 0.415s;
  transform: rotate(150deg);
}

.spinner-blade:nth-child(7) {
  animation-delay: 0.498s;
  transform: rotate(180deg);
}

.spinner-blade:nth-child(8) {
  animation-delay: 0.581s;
  transform: rotate(210deg);
}

.spinner-blade:nth-child(9) {
  animation-delay: 0.664s;
  transform: rotate(240deg);
}

.spinner-blade:nth-child(10) {
  animation-delay: 0.747s;
  transform: rotate(270deg);
}

.spinner-blade:nth-child(11) {
  animation-delay: 0.83s;
  transform: rotate(300deg);
}

.spinner-blade:nth-child(12) {
  animation-delay: 0.913s;
  transform: rotate(330deg);
}

@keyframes spinner-fade {
  0% {
    background-color: var(--spinner-color);
  }

  100% {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner-blade {
    animation: none;
    background-color: var(--spinner-color);
    opacity: 0.35;
  }

  .spinner-blade:nth-child(1),
  .spinner-blade:nth-child(2),
  .spinner-blade:nth-child(3) {
    opacity: 1;
  }
}
</style>
