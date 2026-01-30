<template>
  <TabLayout v-model="activeTab">
    <template #tabs>
      <Tab id="overview">Overview</Tab>
      <Tab id="settings">Settings</Tab>
      <Tab id="danger">Danger Zone</Tab>
    </template>

    <template #overview>
      <BlockText> This is the overview tab. </BlockText>
    </template>

    <template #settings>
      <BlockText> Settings live here. </BlockText>
    </template>

    <template #danger>
      <BlockText> Dangerous actions go here. </BlockText>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import type { TabId } from '@/shared/components/tabs/types'

const activeTab = ref<TabId>('overview')
</script>
