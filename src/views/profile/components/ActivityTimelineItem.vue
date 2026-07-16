<template>
  <li
    class="activity-timeline-item"
    :class="{ 'is-placeholder': isPlaceholder, 'is-mobile': isMobile }"
    :aria-hidden="isPlaceholder || undefined"
  >
    <div class="activity-timeline-item__track" aria-hidden="true">
      <span class="activity-timeline-item__icon">
        <component v-if="icon && !isPlaceholder" :is="icon" :size="16" :stroke-width="2.5" />
      </span>
    </div>

    <div class="activity-timeline-item__content">
      <template v-if="!isPlaceholder">
        <div class="activity-timeline-item__main">
          <BlockText element="h6">
            {{ title }}
          </BlockText>

          <BlockText v-if="description" size="sm" tone="tertiary">
            {{ description }}
          </BlockText>
        </div>

        <BlockText
          v-if="timestamp"
          class="activity-timeline-item__timestamp"
          size="sm"
          tone="secondary"
        >
          {{ timestamp }}
        </BlockText>
      </template>

      <template v-else>
        <div class="activity-timeline-item__main">
          <BlockText element="h6">{{ '\u00A0' }}</BlockText>

          <BlockText size="sm">{{ '\u00A0' }}</BlockText>
        </div>

        <BlockText class="activity-timeline-item__timestamp" size="sm" tone="muted">
          {{ '\u00A0' }}
        </BlockText>
      </template>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import { useViewport } from '@/shared/hooks/useViewport'

const { isMobile } = useViewport()

withDefaults(
  defineProps<{
    icon?: Component
    title?: string
    description?: string | null
    timestamp?: string | null
    isPlaceholder?: boolean
  }>(),
  {
    icon: undefined,
    title: '',
    description: null,
    timestamp: null,
    isPlaceholder: false,
  },
)
</script>

<style scoped lang="scss">
.activity-timeline-item {
  position: relative;

  display: grid;
  grid-template-columns: var(--activity-timeline-icon-size) minmax(0, 1fr);
  align-items: stretch;
  gap: space(3);

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
  background-color: color(control, input-bg);
  border: 0.1rem solid color(border, subtle);
  border-radius: border-radius(md);
}

.activity-timeline-item.is-placeholder .activity-timeline-item__icon {
  background-color: transparent;
  border-style: dashed;
  border-color: color(theme, neutral, theme-alpha, 6);
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
