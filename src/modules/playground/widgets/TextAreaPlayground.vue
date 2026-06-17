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
                <TArea
                  :id="`${autoId}-${state.label}`"
                  :placeholder="$t('playground.copy.replyToComment')"
                  :name="state.label"
                  :value="
                    state.value ? $t('playground.copy.autofill', { 0: '&lt;input&gt;' }) : undefined
                  "
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

import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import TArea from '@/shared/components/inputs/TextArea.vue'
import { useId } from 'vue'

type AreaState = {
  label: string
  disabled?: boolean
  readonly?: boolean
  value?: string
}

const autoId = useId()

const states: AreaState[] = [
  { label: 'default' },
  {
    label: 'disabled',
    disabled: true,
    value: 'playground.copy.autofill',
  },
  {
    label: 'read-only',
    readonly: true,
    value: 'playground.copy.autofill',
  },
]
</script>

<style scoped lang="scss">
.cell {
  width: space(75);
}
</style>
