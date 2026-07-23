<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="6" grow>
      <FlexBox direction="column" :gap="4">
        <BlockText element="h2">
          {{ $t('app.routes.settings') }}
        </BlockText>

        <TabLayout>
          <template #tabs>
            <Tab to="settings-security">
              {{ $t('settings.tabs.account') }}
            </Tab>

            <Tab to="settings-profile">
              {{ $t('settings.tabs.profile') }}
            </Tab>

            <Tab to="settings-sessions">
              {{ $t('settings.tabs.sessions') }}
            </Tab>
          </template>
        </TabLayout>
      </FlexBox>

      <RouterComponent :key="settingsViewKey" />
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import RouterComponent from '@/shared/components/routers/RouterComponent.vue'

import Tab from '@/shared/components/tabs/TabRouter.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'

import { useSettings } from './hooks/useSettingsActions.ts'

const { settingsViewKey } = useSettings()
</script>
