<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <FlexBox :gap="2">
        <BaseButton tone="primary" variant="soft" @click="confirmDialog">
          {{ $t('playground.action.submit') }}
        </BaseButton>
        <BaseButton tone="warning" variant="soft" @click="revokeDialog">
          {{ $t('playground.action.revoke') }}
        </BaseButton>
        <BaseButton tone="danger" variant="soft" @click="deleteDialog">
          {{ $t('playground.action.delete') }}
        </BaseButton>
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
