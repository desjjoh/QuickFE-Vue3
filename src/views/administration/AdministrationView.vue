<script setup lang="ts">
import FixedSidebar from '@/shared/layouts/FixedSidebar.vue'

import AdministrationNavigation from './widgets/AdministrationNavigation.vue'
import { administrationNavigation } from './config/navigation'
import RouterComponent from '@/shared/components/routers/RouterComponent.vue'
</script>

<template>
  <FixedSidebar>
    <template #sidebar>
      <AdministrationNavigation :sections="administrationNavigation" />
    </template>

    <RouterComponent />
  </FixedSidebar>
</template>

<style scoped lang="scss">
section {
  min-height: 40vh;
  padding: space(6);
  scroll-margin-top: calc($masthead-height + space(15));
}
</style>
