<template>
  <TabLayout v-model="activeTab">
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
    </template>
    <template #colors>
      <PlaygroundTable>
        <template #head>
          <tr>
            <th></th>
            <th v-for="tone in tones" :key="tone">
              <InlineText size="sm">{{ tone }}</InlineText>
            </th>
          </tr>
        </template>
        <template #body>
          <tr v-for="variant in variants" :key="variant">
            <td>
              <InlineText size="sm">{{ variant }}</InlineText>
            </td>

            <td v-for="tone in tones" :key="tone">
              <div class="cell">
                <BaseBadge :variant="variant" :tone="tone">documentation</BaseBadge>
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
import type { Variant, Tone } from '@/shared/components/badges/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import InlineText from '@/shared/components/text/InlineText.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

const variants: Variant[] = ['solid', 'soft', 'surface', 'outline']
const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']

const activeTab = ref<TabId>('colors')
</script>
