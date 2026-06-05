<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <PlaygroundTable>
        <template #head>
          <tr>
            <th></th>
            <th v-for="state in states" :key="state.label">
              <InlineText size="sm">{{ state.label }}</InlineText>
            </th>
          </tr>
        </template>

        <template #body>
          <tr>
            <th>
              <InlineText size="sm">classic</InlineText>
            </th>

            <td v-for="state in states" :key="state.label">
              <div class="cell">
                <DateInput :id="state.label" :name="state.label" :disabled="state.disabled" />
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
import DateInput from '@/shared/components/inputs/DateInput.vue'

type State = {
  label: string
  disabled?: boolean
}

const states: State[] = [{ label: 'default' }, { label: 'disabled', disabled: true }]
</script>
