<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
      <Tab id="sizes">{{ $t('playground.header.tabs.allSizes') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <PlaygroundTable>
        <template #head>
          <tr>
            <th></th>
            <th v-for="tone in tones" :key="tone">
              <InlineText size="sm">{{ $t(`playground.table.tone.${tone}`) }}</InlineText>
            </th>
          </tr>
        </template>
        <template #body>
          <tr v-for="variant in variants" :key="variant">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.variant.${variant}`) }}</InlineText>
            </th>

            <td v-for="tone in tones" :key="tone">
              <div class="cell">
                <BaseBadge :variant="variant" :tone="tone"> {{ $t(toneLabels[tone]) }}</BaseBadge>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- ALL SIZES -->
    <template #sizes>
      <PlaygroundTable>
        <template #head>
          <tr>
            <th></th>
            <th v-for="size in sizes" :key="size">
              <InlineText size="sm">{{ $t(`playground.table.size.${size}`) }}</InlineText>
            </th>
          </tr>
        </template>

        <template #body>
          <tr v-for="mode in radiusModes" :key="mode.label">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.variant.${mode.label}`) }}</InlineText>
            </th>

            <td v-for="size in sizes" :key="size">
              <div class="cell">
                <BaseBadge :size="size" :pill="mode.pill">
                  {{ $t('playground.label.label') }}
                </BaseBadge>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Variant, Tone, Size } from '@/library/types/components/badges'

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
  primary: 'playground.label.administrator',
  neutral: 'playground.label.readOnlyRole',
  success: 'playground.label.active',
  warning: 'playground.label.pending',
  danger: 'playground.label.blocked',
  info: 'playground.label.experimental',
}
</script>
