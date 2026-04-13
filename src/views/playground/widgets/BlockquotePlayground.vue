<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="color">Theme colors</Tab>
      <Tab id="examples">Examples</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #color>
      <PlaygroundTable>
        <template #body>
          <tr v-for="variant in variants" :key="variant">
            <th>
              <InlineText size="sm">{{ variant }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockQuote cite="https://example.com/source" :variant="variant">
                  Perfect typography is certainly the most elusive of all arts. Sculpture in stone
                  alone comes near it in obstinacy.
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
              <BlockText>Here is a quote from WWF's website:</BlockText>
              <BlockQuote class="block__quote" cite="https://example.com/source">
                For 60 years, WWF has worked to help people and nature thrive. As the world's
                leading conservation organization, WWF works in nearly 100 countries. At every
                level, we collaborate with people around the world to develop and deliver innovative
                solutions that protect communities, wildlife, and the places in which they live.
              </BlockQuote>
            </FlexBox>
          </GridCell>

          <!-- BLOCKQUOTE DEMO (THEMED) -->
          <GridCell>
            <BlockQuote cite="https://example.com/source" variant="info">
              You can fine-tune emphasis using inline elements like
              <InlineText element="strong">strong</InlineText>,
              <InlineText element="em">emphasis</InlineText>,
              <InlineText element="mark">highlighting</InlineText>, or
              <InlineText element="code">inline code</InlineText>
              without breaking typography consistency.
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

import type { Variant } from '@/shared/components/text/types'

const variants: Variant[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
</script>

<style scoped lang="scss">
.cell {
  max-width: space(105);
}
</style>
