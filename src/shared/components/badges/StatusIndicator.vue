<template>
  <FlexBox align-items="center" :gap="2">
    <span class="status-indicator__marker" :class="`tone-${tone}`" aria-hidden="true"></span>
    <span class="status-indicator__label">
      <slot></slot>
    </span>
  </FlexBox>
</template>

<script setup lang="ts">
import type { Tone } from '@/library/types/components/buttons'
import FlexBox from '../flex/FlexBox.vue'

withDefaults(
  defineProps<{
    tone?: Tone
  }>(),
  {
    tone: 'primary',
  },
)
</script>

<style scoped lang="scss">
$tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.status-indicator {
  --status-color: #{color(theme, primary, theme, 10)};

  display: inline-flex;
  align-items: center;
  gap: space(1.5);

  color: var(--status-color);
  font-size: font-size(sm);
  line-height: ui-line-height(tight);
}

.status-indicator__marker {
  --status-shadow: #{color(theme, primary, theme-alpha, 4)};

  display: block;
  flex: 0 0 auto;

  width: 0.75rem;
  height: 0.75rem;

  background-color: var(--status-color);
  border-radius: border-radius(pill);
  box-shadow: 0 0 1rem 0.3rem var(--status-shadow);

  @each $tone, $palette in $tones {
    &.tone-#{$tone} {
      --status-color: #{color(theme, #{$palette}, theme, 10)};
      --status-shadow: #{color(theme, #{$palette}, theme-alpha, 4)};
    }
  }
}
</style>
