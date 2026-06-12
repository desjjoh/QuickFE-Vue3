<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <form novalidate @submit.prevent>
        <input
          class="sr-only"
          type="text"
          name="username"
          autocomplete="username"
          value="playground@example.com"
          readonly
          tabindex="-1"
          v-show="false"
        />

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
                  <PasswordInput
                    :id="`${autoId}-${state.label}`"
                    :name="state.label"
                    :placeholder="$t('confirmation.passwordVerification.placeholder')"
                    :disabled="state.disabled"
                  />
                </div>
              </td>
            </tr>
          </template>
        </PlaygroundTable>
      </form>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import Tab from '@/shared/components/tabs/TabButton.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'

import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

import { useId } from 'vue'
import PasswordInput from '@/shared/components/inputs/PasswordInput.vue'

type State = {
  label: string
  disabled?: boolean
}

const autoId = useId()

const states: State[] = [{ label: 'default' }, { label: 'disabled', disabled: true }]
</script>

<style scoped lang="scss">
.cell {
  max-width: space(105);
}
</style>

<style scoped lang="scss">
.cell {
  width: space(75);
}
</style>
