<template>
  <FlexBox direction="column" :gap="4" grow>
    <!-- CLIENT HEADER -->
    <GridBox>
      <slot name="header"></slot>
    </GridBox>

    <!-- QUICK STATS -->
    <GridBox :columns="statsGridColumns" :gap="4">
      <slot name="stats"></slot>
    </GridBox>

    <!-- Progress Over Time -->
    <GridBox>
      <slot name="progress"></slot>
    </GridBox>

    <!-- GOALS & RECENT NOTES -->
    <GridBox :columns="activityGridColumns" :gap="4">
      <!-- CURRENT GOALS -->
      <slot name="goals"></slot>

      <!-- RECENT NOTES -->
      <slot name="notes"></slot>
    </GridBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { useViewport } from '@/shared/hooks/useViewport'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import { computed } from 'vue'

const { isTabletUp, isDesktop } = useViewport()

const statsGridColumns = computed<number>(() => {
  if (isDesktop.value) return 4
  if (isTabletUp.value) return 2

  return 1
})

const activityGridColumns = computed<number>(() => {
  if (isTabletUp.value) return 2

  return 1
})
</script>
