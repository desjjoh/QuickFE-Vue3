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
                <BlockQuote cite="https://example.com/source" :variant="variant">
                  {{ $t('playground.copy.typographyQuote') }}
                </BlockQuote>
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
          <!-- BLOCKQUOTE DEMO -->
          <GridCell>
            <FlexBox direction="column" :gap="2">
              <BlockText>{{ $t('playground.copy.wwfIntro') }}</BlockText>
              <BlockQuote class="block__quote" cite="https://example.com/source">
                {{ $t('playground.copy.wwfQuote') }}
              </BlockQuote>
            </FlexBox>
          </GridCell>

          <!-- BLOCKQUOTE DEMO (THEMED) -->
          <GridCell>
            <BlockQuote cite="https://example.com/source" variant="info">
              <i18n-t keypath="playground.copy.inlineEmphasis" tag="span" scope="global">
                <InlineText element="strong">{{ $t('playground.copy.strong') }}</InlineText>
                <InlineText element="em">{{ $t('playground.copy.emphasis') }}</InlineText>
                <InlineText element="mark">{{ $t('playground.copy.highlighting') }}</InlineText>
                <InlineText element="code">{{ $t('playground.copy.inlineCode') }}</InlineText>
              </i18n-t>
            </BlockQuote>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import PlaygroundTable from '../layouts/PlaygroundTable.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import BlockQuote from '@/shared/components/text/BlockQuote.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import type { Variant } from '@/library/types/components/text'

const variants: Variant[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
</script>

<style scoped lang="scss">
.cell {
  max-width: space(105);
}
</style>
