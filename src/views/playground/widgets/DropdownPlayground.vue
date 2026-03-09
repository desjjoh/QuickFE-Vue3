<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="languages">Languages</Tab>
    </template>

    <template #languages>
      <LanguageDropdown />
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import LanguageDropdown from '@/shared/widgets/LanguageDropdown.vue'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'
</script>
