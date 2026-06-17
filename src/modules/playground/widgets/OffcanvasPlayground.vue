<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <PlaygroundShowcase>
        <FlexBox :gap="2">
          <BaseButton variant="soft" tone="info" @click="openLeft">
            {{ $t('playground.action.openLeft') }}
          </BaseButton>
          <BaseButton variant="soft" tone="danger" @click="openRight">
            {{ $t('playground.action.openRight') }}
          </BaseButton>
          <BaseButton variant="soft" tone="warning" @click="openTop">
            {{ $t('playground.action.openTop') }}
          </BaseButton>
          <BaseButton variant="soft" tone="success" @click="openBottom">
            {{ $t('playground.action.openBottom') }}
          </BaseButton>
        </FlexBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import { usePlaygroundOffcanvas } from '../hooks/usePlaygroundOffcanvas'

const { openBottom, openLeft, openRight, openTop } = usePlaygroundOffcanvas()
</script>
