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
                <FlexBox :gap="3">
                  <AvatarItem :src="avatarDemo[tone].src" :alt="$t('accessibility.userAvatar')" />

                  <AvatarItem
                    :variant="variant"
                    :tone="tone"
                    :alt="$t('accessibility.userAvatar')"
                    :fallback="avatarDemo[tone].initials[0]"
                  />

                  <AvatarItem
                    :variant="variant"
                    :tone="tone"
                    :alt="$t('accessibility.userAvatar')"
                    :fallback="avatarDemo[tone].initials"
                  />

                  <AvatarItem
                    :variant="variant"
                    :tone="tone"
                    :alt="$t('accessibility.userAvatar')"
                  />
                </FlexBox>
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
                <AvatarItem :size="size" :radius="radius" :alt="$t('accessibility.userAvatar')">
                  EA
                </AvatarItem>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

import InlineText from '@/shared/components/text/InlineText.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'

import type { Radius, Size, Tone, Variants } from '@/library/types/components/avatars'

const tones: Tone[] = ['primary', 'neutral']
const variants: Variants[] = ['solid', 'soft']

const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'mega']
const radii: Radius[] = ['none', 'sm', 'md', 'lg', 'full']

const avatarDemo: Record<Tone, { src: string; initials: string }> = {
  primary: {
    src: '/assets/avatars/300-20.jpg',
    initials: 'EA',
  },
  neutral: {
    src: '/assets/avatars/300-7.jpg',
    initials: 'VM',
  },
}
</script>
