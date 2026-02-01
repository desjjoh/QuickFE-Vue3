<template>
  <!-- <PlaygroundShowcase :columns="3">
    <FlexBox :gap="3">
      <AvatarItem src="/assets/avatars/300-20.jpg" />
      <AvatarItem>E</AvatarItem>
      <AvatarItem>EA</AvatarItem>
      <AvatarItem />
    </FlexBox>
  </PlaygroundShowcase> -->

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

            <td v-for="tone in tones" :key="tone">
              <div class="cell">
                <FlexBox :gap="3">
                  <AvatarItem :tone="tone" src="/assets/avatars/300-20.jpg" alt="user-avatar" />
                  <AvatarItem :tone="tone">E</AvatarItem>
                  <AvatarItem :tone="tone">EA</AvatarItem>
                  <AvatarItem :tone="tone" />
                </FlexBox>
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

import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
// import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import type { Tone } from '@/shared/components/avatars/types'

const tones: Tone[] = ['primary', 'neutral']
const variants = ['solid', 'soft']

const activeTab = ref<TabId>('colors')
</script>
