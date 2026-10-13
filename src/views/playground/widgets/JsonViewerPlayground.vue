<template>
  <TabLayout>
    <template #tabs>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>
    <template #examples>
      <PlaygroundShowcase>
        <JsonViewer :item="samplePayload" />
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import TabLayout from '@/library/components/tabs/TabLayout.vue'
import Tab from '@/library/components/tabs/TabButton.vue'
import JsonViewer from '@/library/components/text/JsonViewer.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

const samplePayload = {
  id: 'article-example',
  title: 'Getting started',
  published: false,
  version: 3,
  publishedAt: null,
  author: { id: 'user-example', name: 'Avery Morgan' },
  tags: ['news', 'community'],
  changes: [
    { id: 'change-one', field: 'title', before: 'Welcome', after: 'Getting started' },
    { id: 'change-two', field: 'published', before: true, after: false },
  ],
  metadata: {},
  attachments: [],
}
</script>
