<template>
  <ol class="activity-timeline" :class="{ 'is-compact': compact }">
    <ActivityTimelineItem
      v-for="item in displayItems"
      :key="item.id"
      :title="item.title"
      :description="item.description"
      :timestamp="item.timestamp"
      :tone="item.tone"
      :is-placeholder="item.isPlaceholder"
    />
  </ol>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'

import ActivityTimelineItem from './ActivityTimelineItem.vue'

export type ActivityTimelineTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
export type ActivityTimelineItemData = {
  id: string
  title: string
  description?: string | null
  timestamp?: string | null
  tone?: ActivityTimelineTone
}

type ActivityTimelineDisplayItem = {
  id: string
  title?: string
  description?: string | null
  timestamp?: string | null
  tone?: ActivityTimelineTone
  isPlaceholder: boolean
}

const props = withDefaults(
  defineProps<{
    items: ActivityTimelineItemData[]
    compact?: boolean
    itemLimit?: number
  }>(),
  {
    compact: false,
    itemLimit: 5,
  },
)

const displayItems: ComputedRef<ActivityTimelineDisplayItem[]> = computed<
  ActivityTimelineDisplayItem[]
>(() => {
  const visibleItems: ActivityTimelineDisplayItem[] = props.items
    .slice(0, props.itemLimit)
    .map((item: ActivityTimelineItemData): ActivityTimelineDisplayItem => {
      return {
        ...item,
        isPlaceholder: false,
      }
    })

  const placeholderCount: number = Math.max(props.itemLimit - visibleItems.length, 0)

  const placeholderItems: ActivityTimelineDisplayItem[] = Array.from(
    { length: placeholderCount },
    (_value: unknown, index: number): ActivityTimelineDisplayItem => {
      return {
        id: `activity-placeholder-${index}`,
        isPlaceholder: true,
      }
    },
  )

  return [...visibleItems, ...placeholderItems]
})
</script>

<style scoped lang="scss">
.activity-timeline {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-timeline.is-compact {
  --activity-timeline-icon-size: #{space(8)};
  --activity-timeline-row-gap: #{space(2)};
}

.activity-timeline:not(.is-compact) {
  --activity-timeline-icon-size: #{space(3)};
  --activity-timeline-row-gap: #{space(4)};
}
</style>
