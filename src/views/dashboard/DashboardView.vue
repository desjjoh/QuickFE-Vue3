<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="6" class="dashboard__content" grow>
      <TabLayout>
        <template #tabs>
          <Tab to="dashboard-overview">Dashboard overview</Tab>
          <Tab to="dashboard-clients">User management</Tab>
        </template>
      </TabLayout>

      <RouterComponent />
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import RouterComponent from '@/shared/components/routers/RouterComponent.vue'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import Tab from '@/shared/components/tabs/TabRouter.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
</script>
