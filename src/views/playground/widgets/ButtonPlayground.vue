<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
      <Tab id="sizes">{{ $t('playground.header.tabs.allSizes') }}</Tab>
      <Tab id="states">{{ $t('playground.header.tabs.allStates') }}</Tab>
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
                <BaseButton :variant="variant" :tone="tone" :icon="ArrowRight">
                  {{ $t('playground.action.next') }}
                </BaseButton>
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
            <th v-for="radius in radii" :key="radius">
              <InlineText size="sm">{{ $t(`playground.table.radius.${radius}`) }}</InlineText>
            </th>
          </tr>
        </template>
        <template #body>
          <tr v-for="size in sizes" :key="size">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.size.${size}`) }}</InlineText>
            </th>

            <td v-for="radius in radii" :key="radius">
              <div class="cell">
                <BaseButton
                  tone="primary"
                  variant="solid"
                  :size="size"
                  :radius="radius"
                  :icon="ArrowRight"
                >
                  {{ $t('playground.action.next') }}
                </BaseButton>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- ALL STATES (DISABLED & LOADING) -->
    <template #states>
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
          <tr v-for="variant in variants" :key="variant">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.variant.${variant}`) }}</InlineText>
            </th>

            <td v-for="state in states" :key="state.label">
              <div class="cell">
                <BaseButton
                  tone="primary"
                  :variant="variant"
                  :loading="state.loading"
                  :disabled="state.disabled"
                  :icon="ArrowRight"
                >
                  {{ $t('playground.action.next') }}
                </BaseButton>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

import type { Size, Radius, Variant, Tone } from '@/library/types/components/buttons'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

type ButtonState = {
  label: string
  loading?: boolean
  disabled?: boolean
}

const states: ButtonState[] = [
  { label: 'default' },
  { label: 'disabled', disabled: true },
  { label: 'loading', loading: true },
]

const sizes: Size[] = ['sm', 'md', 'lg', 'xl']
const radii: Radius[] = ['none', 'sm', 'md', 'lg', 'full']
const variants: Variant[] = ['solid', 'soft', 'surface', 'outline', 'ghost']
const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
</script>
