<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">Theme Colors</Tab>
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
                <TArea
                  placeholder="Reply to comment"
                  :name="state.label"
                  :value="state.value"
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

type ButtonState = {
  label: string
  disabled?: boolean
  readonly?: boolean
  value?: string
}

const states: ButtonState[] = [
  { label: 'default' },
  {
    label: 'disabled',
    disabled: true,
    value:
      'The :autofill CSS pseudo-class matches when an <input> element has its value autofilled by the browser.',
  },
  {
    label: 'read-only',
    readonly: true,
    value:
      'The :autofill CSS pseudo-class matches when an <input> element has its value autofilled by the browser.',
  },
]
</script>
