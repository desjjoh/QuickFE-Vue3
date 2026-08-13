<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="theme">{{ $t('playground.header.tabs.themeColors') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #theme>
      <PlaygroundTable>
        <template #body>
          <tr>
            <th>
              <InlineText size="sm">{{ $t('playground.table.variant.classic') }}</InlineText>
            </th>

            <td v-for="state in states" :key="state.label">
              <div class="cell">
                <CheckBox
                  :name="state.label"
                  :disabled="state.disabled"
                  :value="state.value"
                  :readonly="state.readonly"
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
import Tab from '@/library/components/tabs/TabButton.vue'
import TabLayout from '@/library/components/tabs/TabLayout.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import CheckBox from '@/library/components/inputs/CheckBox.vue'
import InlineText from '@/library/components/text/InlineText.vue'

type CheckboxState = {
  label: string
  disabled?: boolean
  readonly?: boolean
  value?: boolean
}

const states: CheckboxState[] = [
  { label: 'default' },
  { label: 'disabled', disabled: true, value: true },
  { label: 'disabled', readonly: true, value: true },
]
</script>
