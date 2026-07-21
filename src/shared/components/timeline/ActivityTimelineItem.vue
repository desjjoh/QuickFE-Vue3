<template>
  <li
    class="activity-timeline-item"
    :class="[`tone-${tone}`, { 'is-placeholder': isPlaceholder, 'is-mobile': isMobile }]"
    :aria-hidden="isPlaceholder || undefined"
  >
    <div class="activity-timeline-item__track" aria-hidden="true">
      <span class="activity-timeline-item__icon"> </span>
    </div>

    <div class="activity-timeline-item__content">
      <template v-if="!isPlaceholder">
        <div class="activity-timeline-item__main">
          <BlockText tone="primary">
            {{ title }}
          </BlockText>

          <BlockText v-if="description" size="sm" tone="tertiary">
            {{ description }}
          </BlockText>
        </div>

        <BlockText v-if="timestamp" class="activity-timeline-item__timestamp" size="sm">
          {{ timestamp }}
        </BlockText>
      </template>

      <template v-else>
        <div class="activity-timeline-item__main">
          <BlockText element="h6">{{ '\u00A0' }}</BlockText>

          <BlockText size="sm">{{ '\u00A0' }}</BlockText>
        </div>

        <BlockText class="activity-timeline-item__timestamp" size="sm">
          {{ '\u00A0' }}
        </BlockText>
      </template>
    </div>
  </li>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import { useViewport } from '@/shared/hooks/useViewport'

const { isMobile } = useViewport()

withDefaults(
  defineProps<{
    title?: string
    description?: string | null
    timestamp?: string | null
    tone?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
    isPlaceholder?: boolean
  }>(),
  {
    title: '',
    description: null,
    timestamp: null,
    tone: 'primary',
    isPlaceholder: false,
  },
)
</script>

<style scoped lang="scss">
$activity-timeline-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.activity-timeline-item {
  --activity-timeline-dot-color: #{color(theme, primary, theme-alpha, 9)};

  position: relative;

  display: grid;
  grid-template-columns: var(--activity-timeline-icon-size) minmax(0, 1fr);
  align-items: stretch;
  gap: var(--activity-timeline-row-gap);

  min-width: 0;
}

.activity-timeline-item__track {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  align-self: stretch;
  min-width: 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset-inline-start: 50%;

    width: 0;
    border-inline-start: 0.1rem solid color(border, subtle);

    transform: translateX(-50%);
  }

  &::before {
    inset-block-start: 0;
    inset-block-end: calc(50% + (var(--activity-timeline-icon-size) / 2));
  }

  &::after {
    inset-block-start: calc(50% + (var(--activity-timeline-icon-size) / 2));
    inset-block-end: 0;
  }
}

.activity-timeline-item:first-child .activity-timeline-item__track::before {
  display: none;
}

.activity-timeline-item:last-child .activity-timeline-item__track::after {
  display: none;
}

.activity-timeline-item.is-placeholder .activity-timeline-item__track::before,
.activity-timeline-item.is-placeholder .activity-timeline-item__track::after {
  border-inline-start-style: dashed;
  border-color: color(theme, neutral, theme-alpha, 6);
}

.activity-timeline-item__icon {
  position: relative;
  z-index: 1;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: var(--activity-timeline-icon-size);
  height: var(--activity-timeline-icon-size);

  color: color(theme, neutral, theme, 11);
  background-color: var(--activity-timeline-dot-color);
  border: 0.1rem solid color(border, subtle);
  border-radius: border-radius(round);
}

@each $tone, $palette in $activity-timeline-tones {
  .activity-timeline-item.tone-#{$tone} {
    --activity-timeline-dot-color: #{color(theme, #{$palette}, theme-alpha, 9)};
  }
}

.activity-timeline-item.is-placeholder .activity-timeline-item__icon {
  background-color: transparent;
  border-style: dashed;
  border-color: color(border, subtle);
}

.activity-timeline-item__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: center;
  gap: space(4);

  min-width: 0;
  min-height: calc(var(--activity-timeline-icon-size) + #{space(3)});
  padding-block: space(2);
}

.activity-timeline-item__main {
  display: grid;
  min-width: 0;
}

.activity-timeline-item__timestamp {
  white-space: nowrap;
  text-align: end;
}

.activity-timeline-item.is-mobile .activity-timeline-item__content {
  grid-template-columns: minmax(0, 1fr);
  gap: space(1);
}

.activity-timeline-item.is-mobile .activity-timeline-item__timestamp {
  text-align: start;
}
</style>
