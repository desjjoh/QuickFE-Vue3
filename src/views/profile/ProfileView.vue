<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="6" grow>
      <FlexBox direction="column" :gap="4">
        <BlockText element="h2"> Profile </BlockText>

        <TabLayout>
          <template #tabs>
            <Tab to="profile-account"> Account </Tab>
            <Tab to="profile-activity"> Activity </Tab>
          </template>
        </TabLayout>
      </FlexBox>

      <RouterComponent />
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import RouterComponent from '@/library/components/routers/RouterComponent.vue'

import Tab from '@/library/components/tabs/TabRouter.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import TabLayout from '@/library/components/tabs/TabLayout.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
</script>
