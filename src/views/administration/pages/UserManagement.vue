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
          trend-tone="success"
          trend="up"
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

      <GridCell>
        <StatCard
          title="Most represented country"
          value="Canada"
          value-size="sm"
          trend-tone="success"
          change="1 (100.0%)"
          footer-text="of total users"
        />
      </GridCell>

      <GridCell>
        <StatCard
          title="Primary age group"
          value="30-39"
          trend-tone="success"
          change="1 (100.0%)"
          footer-text="of total users"
        />
      </GridCell>

      <GridCell :span="GridColumns">
        <BaseCard>
          <CardListBody>
            <CardListSection>
              <FlexBox :direction="rowDirection" :align-items="rowAlignItems" :gap="4">
                <FlexBox grow>
                  <SearchField name="search" />
                </FlexBox>
                <FlexBox :direction="rowSubDirection" :gap="4">
                  <BaseButton icon-position="start">Add user</BaseButton>
                </FlexBox>
              </FlexBox>
            </CardListSection>
            <CardListSection></CardListSection>
          </CardListBody>
        </BaseCard>
      </GridCell>
    </GridBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import GridBox from '@/library/components/grid/GridBox.vue'
import GridCell from '@/library/components/grid/GridCell.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import BaseCard from '@/library/components/card/BaseCard.vue'

import StatCard from '@/library/components/card/StatCard.vue'
import CardListBody from '@/library/components/card/CardListBody.vue'
import CardListSection from '@/library/components/card/CardListSection.vue'
import SearchField from '@/library/components/inputs/SearchField.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'

const { isTabletUp, isDesktop, isTablet } = useViewport()

const GridColumns = computed<number>(() => {
  if (isDesktop.value) return 4
  if (isTablet.value) return 2

  return 1
})

const rowDirection = computed<'row' | 'column'>(() => {
  return isDesktop.value ? 'row' : 'column'
})

const rowAlignItems = computed<'stretch' | 'center'>(() => {
  return isDesktop.value ? 'center' : 'stretch'
})

const rowSubDirection = computed<'row' | 'column'>(() => {
  return isTabletUp.value ? 'row' : 'column'
})
</script>
