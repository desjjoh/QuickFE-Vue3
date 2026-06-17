<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <FlexBox :gap="2">
        <BaseButton variant="soft" tone="primary" @click="primaryToast">
          {{ $t('playground.action.primary') }}
        </BaseButton>
        <BaseButton variant="soft" tone="success" @click="successToast">
          {{ $t('playground.action.success') }}
        </BaseButton>
        <BaseButton variant="soft" tone="warning" @click="warningToast">
          {{ $t('playground.action.warning') }}
        </BaseButton>
        <BaseButton variant="soft" tone="danger" @click="dangerToast">
          {{ $t('playground.action.danger') }}
        </BaseButton>
        <BaseButton variant="soft" tone="info" @click="infoToast">
          {{ $t('playground.action.info') }}
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

import { usePlaygroundToasts } from '../hooks/usePlaygroundToasts'

const { primaryToast, successToast, warningToast, dangerToast, infoToast } = usePlaygroundToasts()
</script>
