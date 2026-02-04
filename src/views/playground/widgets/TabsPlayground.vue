<template>
  <TabLayout>
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
    </template>

    <template #colors>
      <PlaygroundTable>
        <template #body>
          <tr v-for="tone in tones" :key="tone">
            <td>
              <InlineText size="sm">{{ tone }}</InlineText>
            </td>

            <td>
              <div class="cell">
                <TabLayout>
                  <template #tabs>
                    <Tab id="accounts">Account</Tab>
                    <Tab id="documents">Documents</Tab>
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
import type { Tone } from '@/shared/components/links/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

const tones: Tone[] = ['primary', 'neutral']
</script>
