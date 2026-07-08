<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="4" full-height>
        <FlexBox align-items="center" :gap="4">
          <span :class="['settings-list-item__icon', `tone-${iconTone}`]">
            <component
              :is="icon"
              :size="iconSize"
              :stroke-width="iconStrokeWidth"
              aria-hidden="true"
            />
          </span>
          <FlexBox direction="column">
            <BlockText element="h5">{{ title }}</BlockText>
            <BlockText v-if="subtitle">{{ subtitle }}</BlockText>
          </FlexBox>
        </FlexBox>

        <FlexBox direction="column" grow>
          <slot></slot>
        </FlexBox>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import type { Component } from 'vue'

type IconTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type Props = {
  title: string
  subtitle?: string
  icon: Component
  iconSize?: number
  iconStrokeWidth?: number
  iconTone?: IconTone
}

withDefaults(defineProps<Props>(), {
  iconSize: 24,
  iconStrokeWidth: 2,
  iconTone: 'primary',
})
</script>

<style scoped lang="scss">
$settings-list-item-icon-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.settings-list-item__icon {
  --settings-list-item-icon-color: #{color(theme, primary, theme, 11)};
  --settings-list-item-icon-bg: #{color(theme, primary, theme-alpha, 3)};

  display: grid;
  place-content: center;

  flex: 0 0 auto;

  width: 4.8rem;
  height: 4.8rem;

  color: var(--settings-list-item-icon-color);
  background-color: var(--settings-list-item-icon-bg);

  border-radius: border-radius(lg);

  @each $tone, $palette in $settings-list-item-icon-tones {
    &.tone-#{$tone} {
      --settings-list-item-icon-color: #{color(theme, #{$palette}, theme, 11)};
      --settings-list-item-icon-bg: #{color(theme, #{$palette}, theme-alpha, 3)};
    }
  }

  &:deep(svg) {
    flex: 0 0 auto;
  }
}
</style>
