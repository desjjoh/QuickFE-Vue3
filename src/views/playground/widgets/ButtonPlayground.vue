<template>
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
            <BaseButton :variant="variant" :tone="tone"> Next <ArrowRight /> </BaseButton>
          </div>
        </td>
      </tr>
    </template>
  </PlaygroundTable>

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
            <BaseButton tone="primary" variant="solid" :size="size" :radius="radius">
              Next <ArrowRight />
            </BaseButton>
          </div>
        </td>
      </tr>
    </template>
  </PlaygroundTable>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

import type { Size, Radius, Variant, Tone } from '@/shared/components/buttons/types'
import BaseButton from '@/shared/components/buttons/baseButton.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

const sizes: Size[] = ['sm', 'md', 'lg', 'xl']
const radii: Radius[] = ['none', 'sm', 'md', 'lg', 'full']
const variants: Variant[] = ['solid', 'soft', 'surface', 'ghost']
const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
</script>
