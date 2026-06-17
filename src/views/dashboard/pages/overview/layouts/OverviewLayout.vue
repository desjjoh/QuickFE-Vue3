<template>
  <FlexBox direction="column" :gap="4" grow>
    <!-- STATS GRID -->
    <GridBox :columns="statsGridColumns" :gap="4">
      <slot name="stats"></slot>
    </GridBox>

    <!-- ERRORS -->
    <GridBox :gap="4">
      <slot name="errors"></slot>
    </GridBox>

    <!-- ACTIVITY & RECOMMENDATIONS -->
    <GridBox :columns="activityGridColumns" :gap="4">
      <slot name="activity"></slot>
      <slot name="recommendations"></slot>
    </GridBox>

    <!-- TOP PERFORMERS -->
    <GridBox>
      <slot name="performers"></slot>
    </GridBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

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
