<template>
  <TabLayout>
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
      <Tab id="sizes">All Sizes</Tab>
    </template>

    <template #colors>
      <PlaygroundTable>
        <template #head>
          <tr>
            <th></th>
            <th v-for="tone in tones" :key="tone">
              <InlineText size="sm">{{ tone }}</InlineText>
            </th>
          </tr>
        </template>
        <template #body>
          <tr v-for="variant in variants" :key="variant">
            <td>
              <InlineText size="sm">{{ variant }}</InlineText>
            </td>

            <td v-for="tone in tones" :key="tone">
              <div class="cell">
                <BaseBadge :variant="variant" :tone="tone">{{ toneLabels[tone] }}</BaseBadge>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <template #sizes>
      <PlaygroundTable>
        <template #head>
          <tr>
            <th></th>
            <th v-for="size in sizes" :key="size">
              <InlineText size="sm">{{ size }}</InlineText>
            </th>
          </tr>
        </template>

        <template #body>
          <tr v-for="mode in radiusModes" :key="mode.label">
            <td>
              <InlineText size="sm">{{ mode.label }}</InlineText>
            </td>

            <td v-for="size in sizes" :key="size">
              <div class="cell">
                <BaseBadge :size="size" :pill="mode.pill">Label</BaseBadge>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Variant, Tone, Size } from '@/shared/components/badges/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import InlineText from '@/shared/components/text/InlineText.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

const variants: Variant[] = ['solid', 'soft', 'surface', 'outline']
const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
const sizes: Size[] = ['sm', 'md', 'lg']

type radius = { label: string; pill: boolean }
const radiusModes: radius[] = [
  { label: 'default', pill: false },
  { label: 'pill', pill: true },
]

const toneLabels: Record<Tone, string> = {
  primary: 'Administrator',
  neutral: 'Read-Only',
  success: 'Active',
  warning: 'Pending',
  danger: 'Blocked',
  info: 'Experimental',
}
</script>
