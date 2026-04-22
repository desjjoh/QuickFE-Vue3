<template>
  <FlexBox
    class="metrics__row"
    :direction="rowDirection"
    :align-items="rowAlignItems"
    :justify-content="rowJustifyContent"
    :gap="6"
    :gap-y="2"
    wrap="wrap"
  >
    <FlexBox :gap="3" align-items="center">
      <AvatarItem v-if="isTabletUp" variant="soft" :fallback="initials" alt="user-avatar" />
      <FlexBox direction="column">
        <BlockText element="h5">
          {{ name }}
        </BlockText>
        <BlockText size="sm" tone="tertiary">
          {{ subtitle }}
        </BlockText>
      </FlexBox>
    </FlexBox>

    <FlexBox
      :direction="rowSubDirection"
      :gap="6"
      :gap-y="2"
      :align-items="rowJustifyContentBadge"
      wrap="wrap"
    >
      <FlexBox :gap="4" wrap="wrap">
        <FlexBox
          v-for="metric in metrics"
          :key="metric.label"
          direction="column"
          wrap="nowrap"
          align-items="center"
        >
          <BlockText element="h4">{{ metric.value }}</BlockText>
          <BlockText size="sm" tone="tertiary">{{ metric.label }}</BlockText>
        </FlexBox>
      </FlexBox>

      <FlexBox :class="[isDesktop && 'badge__container']" :justify-content="rowJustifyContentBadge">
        <BaseBadge :tone="status.tone" variant="soft" truncate>
          {{ status.label }}
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

import type { PerformerMetric, ClientStatus } from '../types/clientmetrics'
import { useViewport } from '@/shared/hooks/useViewport'
import { computed } from 'vue'

defineProps<{
  initials: string
  name: string
  subtitle: string
  metrics: PerformerMetric[]
  status: ClientStatus
}>()

const { isDesktop, isTabletUp } = useViewport()

const rowDirection = computed<'row' | 'column'>(() => {
  return isDesktop.value ? 'row' : 'column'
})

const rowSubDirection = computed<'row' | 'column-reverse'>(() => {
  return isTabletUp.value ? 'row' : 'column-reverse'
})

const rowAlignItems = computed<'flex-start' | 'center'>(() => {
  return isDesktop.value ? 'center' : 'flex-start'
})

const rowJustifyContentBadge = computed<'flex-start' | 'center'>(() => {
  return isTabletUp.value ? 'center' : 'flex-start'
})

const rowJustifyContent = computed<'space-between' | 'flex-start'>(() => {
  return isDesktop.value ? 'space-between' : 'flex-start'
})
</script>

<style scoped lang="scss">
.metrics__row {
  padding: space(2) space(4);

  border-left: solid space(1);
  border-color: color(theme, primary, dark-alpha, 6);

  border-radius: border-radius(md);

  background-color: color(theme, neutral, dark-alpha, 2);

  & .badge__container {
    width: 10ch !important;
  }
}
</style>
