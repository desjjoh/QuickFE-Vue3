<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <FlexBox :gap="2">
        <BaseButton variant="soft" tone="primary" @click="primaryToast">Primary</BaseButton>
        <BaseButton variant="soft" tone="success" @click="successToast">Success</BaseButton>
        <BaseButton variant="soft" tone="warning" @click="warningToast">Warning</BaseButton>
        <BaseButton variant="soft" tone="danger" @click="dangerToast">Danger</BaseButton>
        <BaseButton variant="soft" tone="info" @click="infoToast">Info</BaseButton>
      </FlexBox>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'

import { usePlaygroundToasts } from '../hooks/usePlaygroundToasts'

const { primaryToast, successToast, warningToast, dangerToast, infoToast } = usePlaygroundToasts()
</script>
