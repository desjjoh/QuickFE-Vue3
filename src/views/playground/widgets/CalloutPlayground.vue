<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="color">{{ $t('playground.header.tabs.themeColors') }}</Tab>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #color>
      <PlaygroundTable>
        <template #body>
          <tr v-for="variant in variants" :key="variant">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.variant.${variant}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <CalloutText :variant="variant">
                  {{ $t('playground.copy.typographyQuote') }}
                </CalloutText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <PlaygroundShowcase>
        <GridBox :columns="2" align-items="start">
          <!-- CALLOUT DEMO -->
          <GridCell>
            <CalloutText>
              <i18n-t keypath="playground.copy.calloutBody" tag="span" scope="global">
                <InlineText element="strong">{{ $t('playground.copy.calloutTitle') }}</InlineText>
                <InlineText element="q">{{ $t('playground.copy.legible') }}</InlineText>
                <InlineText element="q">{{ $t('playground.copy.readable') }}</InlineText>
              </i18n-t>
            </CalloutText>
          </GridCell>

          <!-- CALLOUT DEMO (THEMED) -->
          <GridCell>
            <CalloutText variant="warning">
              <i18n-t keypath="playground.copy.accessibilityBody" tag="span" scope="global">
                <InlineText element="strong">
                  {{ $t('playground.copy.accessibilityTip') }}
                </InlineText>
              </i18n-t>
            </CalloutText>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Variant } from '@/library/types/components/text'

import CalloutText from '@/shared/components/text/CalloutComponent.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import PlaygroundTable from '../layouts/PlaygroundTable.vue'

const variants: Variant[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
</script>

<style scoped lang="scss">
.cell {
  max-width: space(105);
}
</style>
