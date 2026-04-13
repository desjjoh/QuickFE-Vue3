<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="examples">Examples</Tab>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <FlexBox :gap="2">
        <BaseButton tone="primary" variant="soft" @click="confirmDialog">Submit</BaseButton>
        <BaseButton tone="warning" variant="soft" @click="revokeDialog">Revoke</BaseButton>
        <BaseButton tone="danger" variant="soft" @click="deleteDialog">Delete</BaseButton>
      </FlexBox>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'

import { usePlaygroundModals } from '../hooks/usePlaygroundModal'

const { confirmDialog, revokeDialog, deleteDialog } = usePlaygroundModals()
</script>
