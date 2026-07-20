<template>
  <CenteredLayout>
    <GridBox :columns="GridColumns" :gap="4">
      <GridCell :span="GridColumns">
        <FlexBox direction="column" :gap="1">
          <BlockText element="h3"> User management </BlockText>
          <BlockText> Search, review, and manage account access across the platform. </BlockText>
        </FlexBox>
      </GridCell>

      <GridCell>
        <StatCard
          title="Total users"
          value="1"
          trend-tone="warning"
          change="0 (0.0%)"
          footer-text="in last 30 days"
        />
      </GridCell>

      <GridCell>
        <StatCard
          title="Active sessions"
          value="1"
          trend-tone="success"
          change="100.0%"
          footer-text="of total users"
        />
      </GridCell>

      <GridCell :span="GridColumns">
        <BaseCard size="lg">
          <CardBody></CardBody>
        </BaseCard>
      </GridCell>
    </GridBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import StatCard from '@/shared/components/card/StatCard.vue'

const { isDesktop, isTablet } = useViewport()

const GridColumns = computed<number>(() => {
  if (isDesktop.value) return 4
  if (isTablet.value) return 2

  return 1
})
</script>
