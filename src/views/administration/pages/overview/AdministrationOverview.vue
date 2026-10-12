<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="6" grow>
      <FlexBox direction="column" :gap="4">
        <BlockText element="h2">
          {{ $t('administration.overview.layout.title') }}
        </BlockText>

        <TabLayout>
          <template #tabs>
            <Tab to="administration-dashboard">
              {{ $t('administration.overview.layout.tabs.dashboard') }}
            </Tab>

            <Tab
              v-if="authStore.canActivate([AuditPermissions.SEARCH_AUDIT])"
              to="administration-activity"
            >
              {{ $t('administration.overview.layout.tabs.activity') }}
            </Tab>
          </template>
        </TabLayout>
      </FlexBox>

      <RouterComponent />
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import Tab from '@/library/components/tabs/TabRouter.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import RouterComponent from '@/library/components/routers/RouterComponent.vue'
import TabLayout from '@/library/components/tabs/TabLayout.vue'
import BlockText from '@/library/components/text/BlockText.vue'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import { useAuthStore } from '@/shared/stores/auth'
import { AuditPermissions } from '@/config/permissions'

const authStore = useAuthStore()
</script>
