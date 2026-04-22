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
      <BaseCard size="lg">
        <CardBody>
          <FlexBox direction="column" :gap="4">
            <FlexBox direction="column" :gap="1">
              <BlockText element="h5">Recent Client Activity</BlockText>
              <BlockText>Last 24 hours</BlockText>
            </FlexBox>

            <slot name="activity"></slot>
          </FlexBox>
        </CardBody>
      </BaseCard>

      <BaseCard size="lg">
        <CardBody>
          <FlexBox direction="column" :gap="4">
            <FlexBox direction="column" :gap="1">
              <BlockText element="h5">AI Recommendations</BlockText>
              <BlockText>Personalized intervention suggestions</BlockText>
            </FlexBox>

            <FlexBox direction="column" :gap="4">
              <slot name="recommendations"></slot>
            </FlexBox>
          </FlexBox>
        </CardBody>
      </BaseCard>
    </GridBox>

    <!-- TOP PERFORMERS -->
    <GridBox>
      <BaseCard size="lg">
        <CardBody>
          <FlexBox direction="column" :gap="4">
            <!-- HEADER -->
            <BlockText element="h5">This Week's Top Performers</BlockText>

            <!-- BODY -->
            <FlexBox direction="column" :gap="2">
              <slot name="performers"></slot>
            </FlexBox>
          </FlexBox>
        </CardBody>
      </BaseCard>
    </GridBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

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
