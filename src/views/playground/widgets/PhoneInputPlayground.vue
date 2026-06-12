<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
    </template>

    <!-- PHONE INPUT -->
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
                <PhoneInput
                  :id="`${autoId}-${state.label}`"
                  :name="state.label"
                  :disabled="state.disabled"
                  default-country="CA"
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
import { useId } from 'vue'

import Tab from '@/shared/components/tabs/TabButton.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'

import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PhoneInput from '@/shared/components/inputs/PhoneInput.vue'

type State = {
  label: string
  disabled?: boolean
}

const autoId = useId()

const states: State[] = [{ label: 'default' }, { label: 'disabled', disabled: true }]
</script>

<style scoped lang="scss">
.cell {
  width: space(100);
}
</style>
