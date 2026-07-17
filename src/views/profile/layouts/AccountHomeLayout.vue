<template>
  <GridBox :columns="GridColumns" :gap="4">
    <GridCell :span="GridColumns">
      <FlexBox direction="column" :gap="1">
        <BlockText element="h3">{{ props.title }}</BlockText>
        <BlockText>
          {{ props.subtitle }}
        </BlockText>
      </FlexBox>
    </GridCell>

    <!-- HEADER -->
    <GridCell :span="GridColumns">
      <slot name="header"></slot>
    </GridCell>

    <!-- STATS -->
    <GridCell :span="statsGridColumns">
      <slot name="timeline"></slot>
    </GridCell>

    <GridCell :span="statsGridColumns">
      <slot name="session"></slot>
    </GridCell>

    <GridCell :span="statsGridColumns">
      <slot name="security"></slot>
    </GridCell>

    <!-- OVERVIEW -->
    <GridCell :span="overviewGridColumns">
      <slot name="overview"></slot>
    </GridCell>

    <GridCell :span="overviewGridColumns">
      <slot name="activity"></slot>
    </GridCell>
  </GridBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

const { isDesktop } = useViewport()

const props = defineProps<{ title: string; subtitle: string }>()

const GridColumns = computed<number>(() => {
  if (isDesktop.value) return 6

  return 1
})

const statsGridColumns = computed<number>(() => {
  if (isDesktop.value) return 2

  return 1
})

const overviewGridColumns = computed<number>(() => {
  if (isDesktop.value) return 3

  return 1
})
</script>
