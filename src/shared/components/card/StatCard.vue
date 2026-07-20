<template>
  <BaseCard class="stat-card" size="lg">
    <CardBody>
      <GridBox :gap="3">
        <BlockText element="h5" weight="semibold" truncate>
          {{ title }}
        </BlockText>

        <BlockText element="h2" truncate>
          {{ value }}
        </BlockText>

        <FlexBox
          v-if="hasFooter"
          :class="`stat-card__footer--${resolvedTrendTone}`"
          align-items="center"
          :gap="2"
          :gap-y="1"
          wrap="wrap"
        >
          <FlexBox v-if="trend !== 'neutral' || change" align-items="center" :gap="1">
            <ArrowUp
              v-if="trend === 'up'"
              class="stat-card__trend-icon"
              :stroke-width="3"
              aria-hidden="true"
            />

            <ArrowDown
              v-else-if="trend === 'down'"
              class="stat-card__trend-icon"
              :stroke-width="3"
              aria-hidden="true"
            />

            <ArrowUpDown
              v-else
              class="stat-card__trend-icon"
              :stroke-width="3"
              aria-hidden="true"
            />

            <BlockText
              v-if="change"
              class="stat-card__change"
              tone="inherit"
              weight="semibold"
              no-wrap
            >
              {{ change }}
            </BlockText>
          </FlexBox>

          <BlockText v-if="footerText" tone="secondary" no-wrap>
            {{ footerText }}
          </BlockText>
        </FlexBox>
      </GridBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-vue-next'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import GridBox from '../grid/GridBox.vue'
import FlexBox from '../flex/FlexBox.vue'

type StatCardTrend = 'up' | 'down' | 'neutral'

type StatCardTone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'

type StatCardProps = {
  title: string
  value: string
  change?: string
  footerText?: string
  trend?: StatCardTrend
  trendTone?: StatCardTone
}

const props = withDefaults(defineProps<StatCardProps>(), {
  change: '',
  footerText: '',
  trend: 'neutral',
  trendTone: undefined,
})

const hasFooter: ComputedRef<boolean> = computed<boolean>(() => {
  return !!props.change || !!props.footerText
})

const resolvedTrendTone: ComputedRef<StatCardTone> = computed<StatCardTone>(() => {
  if (props.trendTone) return props.trendTone

  if (props.trend === 'up') return 'success'
  if (props.trend === 'down') return 'danger'

  return 'neutral'
})
</script>

<style scoped lang="scss">
.stat-card {
  height: 100%;
  min-width: 0;
}

.stat-card__content {
  display: grid;
  gap: space(2);

  min-width: 0;
}

.stat-card__footer--primary {
  color: color(theme, primary, theme-alpha, 11);
}

.stat-card__footer--success {
  color: color(theme, success, theme-alpha, 11);
}

.stat-card__footer--danger {
  color: color(theme, danger, theme-alpha, 11);
}

.stat-card__footer--warning {
  color: color(theme, warning, theme-alpha, 11);
}

.stat-card__footer--info {
  color: color(theme, info, theme-alpha, 11);
}

.stat-card__footer--neutral {
  color: color(theme, neutral, theme-alpha, 11);
}

.stat-card__trend-icon {
  flex: 0 0 auto;

  width: 1em;
  height: 1em;
}

.stat-card__change {
  flex: 0 1 auto;
  min-width: 0;
}

.stat-card__footer-text {
  flex: 0 1 auto;
  min-width: 0;

  color: color(text, secondary);
}
</style>
