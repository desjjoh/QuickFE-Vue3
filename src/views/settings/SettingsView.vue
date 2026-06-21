<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="6" grow>
      <FlexBox direction="column" :gap="2">
        <BlockText element="h2">
          {{ $t('app.routes.settings') }}
        </BlockText>

        <TabLayout>
          <template #tabs>
            <Tab to="settings-security">Security and privacy</Tab>
            <Tab to="settings-profile">Profile</Tab>
          </template>
        </TabLayout>
      </FlexBox>

      <RouterComponent :key="routerViewKey" />
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import RouterComponent from '@/shared/components/routers/RouterComponent.vue'

import Tab from '@/shared/components/tabs/TabRouter.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'

const route = useRoute()
const routerViewKey = computed<string>(() => String(route.name ?? route.path))
</script>
