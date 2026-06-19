<template>
  <StackedLayout>
    <FlexBox direction="column" :gap="6">
      <FlexBox direction="column" :gap="2">
        <BlockText element="h2">Settings</BlockText>

        <TabLayout>
          <template #tabs>
            <Tab to="dashboard-overview">Security and privacy</Tab>
            <Tab to="dashboard-clients">Profile</Tab>
          </template>
        </TabLayout>
      </FlexBox>

      <RouterComponent :key="routerViewKey" />
    </FlexBox>
  </StackedLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import RouterComponent from '@/shared/components/routers/RouterComponent.vue'

import Tab from '@/shared/components/tabs/TabRouter.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import StackedLayout from '@/shared/layouts/StackedLayout.vue'

const route = useRoute()
const routerViewKey = computed<string>(() => String(route.name ?? route.path))
</script>
