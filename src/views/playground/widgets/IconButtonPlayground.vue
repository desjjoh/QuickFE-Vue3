<template>
  <TabLayout>
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
      <Tab id="sizes">All sizes</Tab>
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
                <FlexBox :gap="3">
                  <IconButton :icon="Star" label="icon-button" :variant="variant" :tone="tone" />
                  <IconButton
                    disabled
                    :icon="Star"
                    label="icon-button"
                    :variant="variant"
                    :tone="tone"
                  />
                  <IconButton
                    loading
                    :icon="Star"
                    label="icon-button"
                    :variant="variant"
                    :tone="tone"
                  />
                </FlexBox>
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
            <th v-for="radius in radii" :key="radius">
              <InlineText size="sm">{{ radius }}</InlineText>
            </th>
          </tr>
        </template>
        <template #body>
          <tr v-for="size in sizes" :key="size">
            <td>
              <InlineText size="sm">{{ size }}</InlineText>
            </td>

            <td v-for="radius in radii" :key="radius">
              <div class="cell">
                <IconButton
                  :icon="Star"
                  label="icon-button"
                  tone="primary"
                  variant="solid"
                  :size="size"
                  :radius="radius"
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
import { Star } from 'lucide-vue-next'

import type { Size, Radius, Variant, Tone } from '@/shared/components/buttons/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import InlineText from '@/shared/components/text/InlineText.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'

const sizes: Size[] = ['sm', 'md', 'lg', 'xl']
const radii: Radius[] = ['none', 'sm', 'md', 'lg', 'full']
const variants: Variant[] = ['solid', 'soft', 'surface', 'outline', 'ghost']
const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
</script>
