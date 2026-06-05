<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell v-for="card in cards" :key="card.id">
            <ArticleExampleCard v-bind="card">
              <template #content>
                <BlockText>
                  <i18n-t keypath="playground.copy.cardBody" tag="span" scope="global">
                    <InlineText element="strong">
                      {{ $t('playground.copy.typography') }}
                    </InlineText>
                  </i18n-t>
                </BlockText>
              </template>
            </ArticleExampleCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BlockText from '@/shared/components/text/BlockText.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import ArticleExampleCard from '../components/ArticleExampleCard.vue'

type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type CardTag = {
  label: string
  tone?: BadgeTone
}

type ContentCardItem = {
  id: string

  imageSrc: string
  imageAlt: string
  imageSize: number

  tags: CardTag[]

  authorName: string
  authorEmail: string
  authorAvatarSrc?: string
  authorAvatarFallback?: string
  authorAvatarVariant?: 'solid' | 'soft'
}

const cards: ContentCardItem[] = [
  {
    id: 'card-1',
    imageSrc: '/assets/stock/600x400/img-78.jpg',
    imageAlt: 'Typography article preview',
    imageSize: 50,

    tags: [
      { label: 'playground.card.technology' },
      { label: 'playground.card.design', tone: 'neutral' },
    ],

    authorName: 'Emily Adams',
    authorEmail: 'emily.adams@example.com',
    authorAvatarSrc: '/assets/avatars/300-20.jpg',
  },
  {
    id: 'card-2',
    imageSrc: '/assets/stock/600x400/img-80.jpg',
    imageAlt: 'Typography article preview',
    imageSize: 50,

    tags: [
      { label: 'playground.card.technology' },
      { label: 'playground.card.design', tone: 'neutral' },
    ],

    authorName: 'Emily Adams',
    authorEmail: 'emily.adams@example.com',
    authorAvatarFallback: 'EA',
    authorAvatarVariant: 'soft',
  },
  {
    id: 'card-3',

    imageSrc: '/assets/stock/600x400/img-76.jpg',
    imageAlt: 'Typography article preview',
    imageSize: 50,

    tags: [
      { label: 'playground.card.technology' },
      { label: 'playground.card.design', tone: 'neutral' },
    ],

    authorName: 'Emily Adams',
    authorEmail: 'emily.adams@example.com',
    authorAvatarVariant: 'soft',
  },
]
</script>
