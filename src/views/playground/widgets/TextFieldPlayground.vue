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
                <TextField
                  :value="state.value ? $t(state.value) : undefined"
                  :placeholder="$t('playground.copy.search')"
                  :name="state.label"
                  :disabled="state.disabled"
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
import Tab from '@/shared/components/tabs/TabButton.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'

import TextField from '@/shared/components/inputs/TextField.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

type FieldState = {
  label: string
  disabled?: boolean
  readonly?: boolean
  value?: string
}

const states: FieldState[] = [
  { label: 'default' },
  { label: 'disabled', disabled: true, value: 'playground.copy.quickBrownFox' },
  { label: 'read-only', readonly: true, value: 'playground.copy.quickBrownFox' },
]
</script>

<style scoped lang="scss">
.cell {
  width: space(75);
}
</style>
