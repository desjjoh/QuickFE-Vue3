<template>
  <PlaygroundShowcase>
    <GridBox :columns="2">
      <GridCell :span="1">
        <BaseCard>
          <CardBody>
            <FlexBox direction="column" :gap="4">
              <FlexBox direction="column" :gap="2">
                <BlockText element="h5">Revoke access</BlockText>
                <BlockText>
                  Are you sure? This application will no longer be accessible and any existing
                  sessions will be expired.
                </BlockText>
              </FlexBox>

              <FlexBox justify-content="flex-end" :gap="3">
                <BaseButton tone="neutral" variant="soft">Cancel</BaseButton>
                <BaseButton tone="danger">Revoke</BaseButton>
              </FlexBox>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>
    </GridBox>
  </PlaygroundShowcase>

  <TabLayout>
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
      <Tab id="sizes">All sizes</Tab>
      <Tab id="states">All states</Tab>
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
                <BaseButton :variant="variant" :tone="tone"> Next <ArrowRight /> </BaseButton>
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
                <BaseButton tone="primary" variant="solid" :size="size" :radius="radius">
                  Next <ArrowRight />
                </BaseButton>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <template #states>
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
            <td>
              <InlineText size="sm">{{ variant }}</InlineText>
            </td>

            <td v-for="state in states" :key="state.label">
              <div class="cell">
                <BaseButton
                  tone="primary"
                  :variant="variant"
                  :loading="state.loading"
                  :disabled="state.disabled"
                >
                  Next <ArrowRight />
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

import type { Size, Radius, Variant, Tone } from '@/shared/components/buttons/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
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
