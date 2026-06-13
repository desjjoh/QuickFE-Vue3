<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="3">
        <BlockText element="h5">
          {{ title }}
        </BlockText>

        <BlockText element="h2">
          {{ value }}
        </BlockText>

        <FlexBox align-items="center" :gap="2" :class="[trend && `trend-${trend}`]">
          <ArrowUp v-if="trend === 'up'" :stroke-width="3" />
          <ArrowDown v-else-if="trend === 'down'" :stroke-width="3" />

          <BlockText weight="medium">
            {{ footerText }}
          </BlockText>
        </FlexBox>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from 'lucide-vue-next'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

type StatCard = {
  title: string
  value: string
  footerText: string
  trend?: 'up' | 'down'
}

defineProps<StatCard>()
</script>

<style scoped lang="scss">
.trend-up {
  color: color(theme, success, theme-alpha, 11);
}

.trend-down {
  color: color(theme, danger, theme-alpha, 11);
}

:deep(svg) {
  width: 1em;
  height: 1em;
  flex: none;
}
</style>
