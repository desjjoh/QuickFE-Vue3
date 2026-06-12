<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <PlaygroundTable>
        <template #head>
          <tr>
            <th></th>
            <th v-for="state in states" :key="state.label">
              <InlineText size="sm">{{ $t(`playground.table.state.${state.label}`) }}</InlineText>
            </th>
          </tr>
        </template>

        <template #body>
          <tr>
            <th>
              <InlineText size="sm">{{ $t('playground.table.variant.classic') }}</InlineText>
            </th>

            <td v-for="state in states" :key="state.label">
              <div class="cell">
                <SelectInput
                  :id="`${autoId}-${state.label}`"
                  :name="state.label"
                  :disabled="state.disabled"
                  :get-label="(item: string) => $t(`playground.option.status.${item}`)"
                  :get-key="(item: string) => item"
                  :options="['allStatuses', 'active', 'atRisk', 'inactive']"
                />
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
import SelectInput from '@/shared/components/inputs/SelectInput.vue'
import { useId } from 'vue'

type SelectState = {
  label: string
  disabled?: boolean
}

const autoId = useId()

const states: SelectState[] = [{ label: 'default' }, { label: 'disabled', disabled: true }]
</script>

<style scoped lang="scss">
.cell {
  width: space(75);
}
</style>
