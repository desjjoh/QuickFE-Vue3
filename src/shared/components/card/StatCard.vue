<template>
  <BaseCard class="stat-card" size="lg">
    <CardBody class="stat-card__body">
      <GridBox class="stat-card__content" :gap="3">
        <BlockText element="h5" weight="semibold" truncate>
          {{ title }}
        </BlockText>

        <BlockText class="stat-card__value" element="h3" truncate>
          {{ value }}
        </BlockText>

        <BlockText
          v-if="hasFooter"
          class="stat-card__footer"
          :class="`stat-card__footer--${resolvedTrendTone}`"
          tone="inherit"
          truncate
        >
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
            v-else-if="change"
            class="stat-card__trend-icon"
            :stroke-width="3"
            aria-hidden="true"
          />

          <InlineText v-if="change" class="stat-card__change" weight="semibold">
            {{ change }}
          </InlineText>

          {{ footerText }}
        </BlockText>
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
import InlineText from '@/shared/components/text/InlineText.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

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

.stat-card__body {
  height: 100%;
}

.stat-card__content {
  grid-template-rows: auto minmax(0, 1fr) auto;

  height: 100%;
  min-width: 0;
  min-height: 0;
}

$stat-card-tones: (
  primary: color(theme, primary, theme-alpha, 11),
  success: color(theme, success, theme-alpha, 11),
  danger: color(theme, danger, theme-alpha, 11),
  warning: color(theme, warning, theme-alpha, 11),
  info: color(theme, info, theme-alpha, 11),
  neutral: color(theme, neutral, theme-alpha, 11),
);

.stat-card__value {
  align-self: center;

  min-width: 0;

  line-height: ui-line-height(relaxed);
}

.stat-card__value--sm {
  overflow-wrap: anywhere;

  font-size: font-size(h3);
  line-height: ui-line-height(tight);
}

.stat-card__footer {
  --stat-card-trend-color: #{token($stat-card-tones, neutral)};

  min-width: 0;
  max-width: 100%;
}

@each $tone, $color in $stat-card-tones {
  .stat-card__footer--#{$tone} {
    --stat-card-trend-color: #{$color};
  }
}

.stat-card__trend-icon,
.stat-card__change {
  color: var(--stat-card-trend-color);
}

.stat-card__change {
  margin-inline-end: space(1);
}

.stat-card__trend-icon {
  display: inline-block;

  width: 1.2em;
  height: 1.2em;
  margin-inline-end: space(1);

  vertical-align: -0.2em;
}
</style>
