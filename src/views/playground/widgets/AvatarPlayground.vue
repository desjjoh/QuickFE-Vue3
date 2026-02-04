<template>
  <PlaygroundShowcase>
    <GridBox :columns="3">
      <GridCell>
        <BaseCard>
          <CardBody>
            <FlexBox :gap="3" align-items="center">
              <AvatarItem src="/assets/avatars/300-20.jpg" alt="user-avatar" />
              <FlexBox direction="column" overflow="hidden" grow>
                <BlockText truncate element="h5">Emily Adams</BlockText>
                <BlockText truncate>
                  <InlineText element="i">emily.adams@example.com</InlineText>
                </BlockText>
              </FlexBox>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>

      <GridCell>
        <BaseCard>
          <CardBody>
            <FlexBox :gap="3" align-items="center">
              <AvatarItem variant="soft">EA</AvatarItem>
              <FlexBox direction="column" overflow="hidden">
                <BlockText truncate element="h5">Emily Adams</BlockText>
                <BlockText truncate>
                  <InlineText element="i">emily.adams@example.com</InlineText>
                </BlockText>
              </FlexBox>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>

      <GridCell>
        <BaseCard>
          <CardBody>
            <FlexBox :gap="3" align-items="center">
              <AvatarItem variant="soft" />
              <FlexBox direction="column" overflow="hidden">
                <BlockText truncate element="h5">Emily Adams</BlockText>
                <BlockText truncate>
                  <InlineText element="i">emily.adams@example.com</InlineText>
                </BlockText>
              </FlexBox>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>
    </GridBox>
  </PlaygroundShowcase>

  <TabLayout v-model="activeTab">
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

            <td v-for="(tone, toneIndex) in tones" :key="tone">
              <div class="cell">
                <FlexBox :gap="3">
                  <AvatarItem :src="avatarImages[toneIndex]" alt="user-avatar" />
                  <AvatarItem :variant="variant" :tone="tone">E</AvatarItem>
                  <AvatarItem :variant="variant" :tone="tone">EA</AvatarItem>
                  <AvatarItem :variant="variant" :tone="tone" />
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
                <AvatarItem :size="size" :radius="radius">EA</AvatarItem>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { TabId } from '@/shared/components/tabs/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

import InlineText from '@/shared/components/text/InlineText.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import type { Radius, Size, Tone, Variants } from '@/shared/components/avatars/types'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import CardBody from '@/shared/components/card/CardBody.vue'

const tones: Tone[] = ['primary', 'neutral']
const variants: Variants[] = ['solid', 'soft']

const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'mega']
const radii: Radius[] = ['none', 'sm', 'md', 'lg', 'full']

const avatarImages = ['/assets/avatars/300-20.jpg', '/assets/avatars/300-7.jpg']

const activeTab = ref<TabId>('colors')
</script>
