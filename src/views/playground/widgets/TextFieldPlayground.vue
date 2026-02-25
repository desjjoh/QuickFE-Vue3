<template>
  <TabLayout>
    <template #tabs>
      <Tab id="colors">Theme Colors</Tab>
      <Tab id="sizes">All Sizes</Tab>
    </template>
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
          <tr v-for="variant in variants" :key="variant">
            <th>
              <InlineText size="sm">{{ variant }}</InlineText>
            </th>

            <td v-for="state in states" :key="state.label">
              <div class="cell">
                <TextField
                  :value="state.value"
                  :variant="variant"
                  placeholder="Search"
                  :name="`${variant}-${state.label}`"
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

type ButtonState = {
  label: string
  disabled?: boolean
  readonly?: boolean
  value?: string
}

type Variant = 'classic' | 'soft'
const variants: Variant[] = ['classic', 'soft']

const states: ButtonState[] = [
  { label: 'default' },
  { label: 'disabled', disabled: true, value: 'Quick brown fox' },
  { label: 'read-only', readonly: true, value: 'Quick brown fox' },
]
</script>
