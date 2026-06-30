<template>
  <CardListItem>
    <template #start>
      <span :class="['settings-list-item__icon', `tone-${iconTone}`]">
        <component :is="icon" :size="iconSize" :stroke-width="iconStrokeWidth" aria-hidden="true" />
      </span>
    </template>

    <BlockText element="h6" weight="semibold">
      {{ title }}
    </BlockText>

    <BlockText v-if="description" size="sm" tone="secondary">
      {{ description }}
    </BlockText>

    <template v-if="$slots.value" #value>
      <slot name="value"></slot>
    </template>

    <template v-if="$slots.default" #end>
      <div class="settings-list-item__actions" :class="{ 'is-mobile': isMobile }">
        <slot></slot>
      </div>
    </template>
  </CardListItem>
</template>

<script setup lang="ts">
import { type Component } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import CardListItem from '@/shared/components/card/CardListItem.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

type IconTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

withDefaults(
  defineProps<{
    title: string
    description?: string
    icon: Component
    iconSize?: number
    iconStrokeWidth?: number
    iconTone?: IconTone
  }>(),
  {
    description: undefined,
    iconSize: 24,
    iconStrokeWidth: 2.5,
    iconTone: 'primary',
  },
)

const { isMobile } = useViewport()
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
  --settings-list-item-icon-bg: #{color(theme, primary, theme-alpha, 2)};
  --settings-list-item-icon-border: #{color(theme, primary, theme-alpha, 7)};
  --settings-list-item-icon-shadow: #{color(theme, primary, theme-alpha, 5)};

  display: grid;
  place-content: center;

  flex: 0 0 auto;

  width: 4.8rem;
  height: 4.8rem;

  color: var(--settings-list-item-icon-color);
  background-color: var(--settings-list-item-icon-bg);

  border: 0.1rem solid var(--settings-list-item-icon-border);
  border-radius: border-radius(lg);

  box-shadow:
    inset 0 0 0 0.1rem color(theme, neutral, theme-alpha, 2),
    0 0 1.5rem var(--settings-list-item-icon-shadow);

  @each $tone, $palette in $settings-list-item-icon-tones {
    &.tone-#{$tone} {
      --settings-list-item-icon-color: #{color(theme, #{$palette}, theme, 11)};
      --settings-list-item-icon-bg: #{color(theme, #{$palette}, theme-alpha, 2)};
      --settings-list-item-icon-border: #{color(theme, #{$palette}, theme-alpha, 7)};
      --settings-list-item-icon-shadow: #{color(theme, #{$palette}, theme-alpha, 5)};
    }
  }

  &:deep(svg) {
    flex: 0 0 auto;
  }
}

.settings-list-item__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: space(3);
  flex-wrap: wrap;

  min-width: 0;
}

.settings-list-item__actions.is-mobile {
  width: 100%;
  flex-direction: column;
  align-items: stretch;
}

.settings-list-item__actions.is-mobile :deep(button),
.settings-list-item__actions.is-mobile :deep(a) {
  width: 100%;
  justify-content: center;
}
</style>
