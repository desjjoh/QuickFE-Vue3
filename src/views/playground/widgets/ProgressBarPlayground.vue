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
          <tr v-for="state in states" :key="state.tone">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.tone.${state.tone}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <ProgressBar :value="state.value" :tone="state.tone" />
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import Tab from '@/shared/components/tabs/TabButton.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'

import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import ProgressBar from '@/shared/components/progress/ProgressBar.vue'

type ProgressTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type ProgressState = {
  tone: ProgressTone
  value: number
}

const states: ProgressState[] = [
  { tone: 'primary', value: 25 },
  { tone: 'neutral', value: 35 },
  { tone: 'success', value: 50 },
  { tone: 'warning', value: 65 },
  { tone: 'danger', value: 80 },
  { tone: 'info', value: 95 },
]
</script>

<style scoped lang="scss">
.cell {
  width: space(105);
}
</style>
