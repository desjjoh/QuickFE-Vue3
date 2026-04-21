<template>
  <FlexBox
    :direction="rowDirection"
    :align-items="rowAlignItems"
    :justify-content="rowJustifyContent"
    :gap="4"
    wrap="wrap"
  >
    <FlexBox :gap="3" align-items="center" shrink>
      <AvatarItem variant="soft" :fallback="initials" alt="user-avatar" />
      <FlexBox direction="column" shrink>
        <BlockText element="h5">
          {{ name }}
        </BlockText>
        <BlockText size="sm" tone="tertiary">
          {{ subtitle }}
        </BlockText>
      </FlexBox>
    </FlexBox>

    <FlexBox
      :direction="rowDirectionMetrics"
      :gap="6"
      :gap-y="4"
      :align-items="rowAlignItemsMetrics"
      wrap="wrap"
      shrink
    >
      <FlexBox :gap="4" :align-items="rowAlignItemsMetrics" wrap="wrap" shrink>
        <FlexBox
          v-for="metric in metrics"
          :key="metric.label"
          direction="column"
          wrap="nowrap"
          :align-items="metricAlignItems"
        >
          <BlockText element="h4">{{ metric.value }}</BlockText>
          <BlockText size="sm" tone="tertiary">{{ metric.label }}</BlockText>
        </FlexBox>
      </FlexBox>

      <FlexBox :class="[isDesktop && 'badge__container']" :justify-content="rowJustifyContentBadge">
        <BaseBadge tone="success" variant="soft" truncate>
          {{ status }}
        </BaseBadge>
      </FlexBox>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

import type { PerformerMetric } from '../types/topperformer'
import { useViewport } from '@/shared/hooks/useViewport'
import { computed } from 'vue'

defineProps<{
  initials: string
  name: string
  subtitle: string
  metrics: PerformerMetric[]
  status: string
}>()

const { isDesktop, isTabletUp } = useViewport()

const rowDirection = computed<'row' | 'column'>(() => {
  return isDesktop.value ? 'row' : 'column'
})

const rowAlignItems = computed<'flex-start' | 'center'>(() => {
  return isDesktop.value ? 'center' : 'flex-start'
})

const rowDirectionMetrics = computed<'row' | 'column'>(() => {
  return isTabletUp.value ? 'row' : 'column'
})

const rowJustifyContentBadge = computed<'flex-start' | 'center'>(() => {
  return isTabletUp.value ? 'center' : 'flex-start'
})

const rowAlignItemsMetrics = computed<'flex-start' | 'center'>(() => {
  return isTabletUp.value ? 'center' : 'flex-start'
})

const metricAlignItems = computed<'flex-start' | 'center'>(() => {
  return isTabletUp.value ? 'center' : 'flex-start'
})

const rowJustifyContent = computed<'space-between' | 'flex-start'>(() => {
  return isDesktop.value ? 'space-between' : 'flex-start'
})
</script>

<style scoped lang="scss">
.badge__container {
  width: space(25) !important;
}
</style>
