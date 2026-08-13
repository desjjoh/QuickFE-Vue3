<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <PlaygroundTable>
        <template #body>
          <tr v-for="tone in tones" :key="tone">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.tone.${tone}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <TabLayout :tone="tone">
                  <template #tabs>
                    <Tab id="accounts">{{ $t('app.routes.profile') }}</Tab>
                    <Tab id="documents">{{ $t('playground.header.sections.forms') }}</Tab>
                  </template>
                </TabLayout>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Tone } from '@/library/components/tabs/tabs'

import TabLayout from '@/library/components/tabs/TabLayout.vue'
import Tab from '@/library/components/tabs/TabButton.vue'

import InlineText from '@/library/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

const tones: Tone[] = ['primary', 'neutral']
</script>
