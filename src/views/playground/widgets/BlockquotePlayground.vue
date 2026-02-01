<template>
  <PlaygroundShowcase>
    <FlexBox direction="column" :gap="2">
      <BlockText>Here is a quote from WWF's website:</BlockText>
      <BlockQuote class="block__quote" cite="https://example.com/source">
        For 60 years, WWF has worked to help people and nature thrive. As the world's leading
        conservation organization, WWF works in nearly 100 countries. At every level, we collaborate
        with people around the world to develop and deliver innovative solutions that protect
        communities, wildlife, and the places in which they live.
      </BlockQuote>
    </FlexBox>

    <BlockQuote cite="https://example.com/source" variant="info">
      You can fine-tune emphasis using inline elements like
      <InlineText element="strong">strong</InlineText>,
      <InlineText element="em">emphasis</InlineText>,
      <InlineText element="mark">highlighting</InlineText>, or
      <InlineText element="code">inline code</InlineText>
      without breaking typography consistency.
    </BlockQuote>
  </PlaygroundShowcase>
  <TabLayout v-model="activeTab">
    <template #tabs>
      <Tab id="color">Theme colors</Tab>
    </template>

    <template #color>
      <PlaygroundTable>
        <template #body>
          <tr v-for="variant in variants" :key="variant">
            <td>
              <InlineText size="sm">{{ variant }}</InlineText>
            </td>

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
  </TabLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { TabId } from '@/shared/components/tabs/types'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import PlaygroundTable from '../layouts/PlaygroundTable.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import BlockQuote from '@/shared/components/text/BlockQuote.vue'
import type { Variant } from '@/shared/components/text/types'

const variants: Variant[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']

const activeTab = ref<TabId>('color')
</script>

<style scoped lang="scss">
.cell {
  max-width: space(105);
}
</style>
