<template>
  <FlexBox direction="column" class="timeline-list" :gap="4">
    <div
      v-for="item in items"
      :key="item.id"
      class="timeline-list__item"
      :class="[`timeline-list__item--${item.tone ?? 'default'}`]"
    >
      <div class="timeline-list__rail">
        <div class="timeline-list__dot"></div>
        <div class="timeline-list__line"></div>
      </div>

      <FlexBox direction="column" :gap="1" class="timeline-list__content">
        <BlockText weight="medium" element="h6">
          {{ item.title }}
        </BlockText>

        <BlockText v-if="item.description">
          {{ item.description }}
        </BlockText>

        <BlockText tone="tertiary">
          {{ item.timestamp }}
        </BlockText>
      </FlexBox>
    </div>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import type { Tone } from '@/shared/types/components/buttons'

export type TimelineItem = {
  id: string
  title: string
  description?: string
  timestamp: string
  tone: Tone
}

defineProps<{
  items: TimelineItem[]
}>()
</script>

<style scoped lang="scss">
$dot-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.timeline-list {
  width: 100%;
}

.timeline-list__item {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: space(4);

  &.timeline-list__item:last-child .timeline-list__line {
    display: none;
  }
}

.timeline-list__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: space(4);

  & .timeline-list__dot {
    width: space(3);
    height: space(3);
    border-radius: 50%;
    flex: none;
  }

  & .timeline-list__line {
    width: 0.2rem;
    flex: 1 1 auto;
    min-height: space(6);
    background-color: color(border, base);
  }
}

@each $tone, $palette in $dot-tones {
  .timeline-list__item--#{$tone} .timeline-list__dot {
    background-color: color(theme, #{$palette}, theme-alpha, 9);
  }
}
</style>
