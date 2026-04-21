<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="4" class="dashboard__content" grow>
      <TabLayout>
        <template #tabs>
          <Tab to="dashboard-overview">Dashboard overview</Tab>
          <Tab to="dashboard-client-management">Client management</Tab>
        </template>
      </TabLayout>

      <RouterView :key="routerViewKey" />
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import RouterView from '@/router/components/RouterView.vue'

import CenteredLayout from '@/router/layouts/CenteredLayout.vue'
import Tab from '@/shared/components/tabs/TabRouter.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'

const route = useRoute()
const routerViewKey = computed<string>(() => String(route.name ?? route.path))
</script>

<style lang="scss" scoped>
.dashboard__content {
  min-height: 100%;
}
</style>
