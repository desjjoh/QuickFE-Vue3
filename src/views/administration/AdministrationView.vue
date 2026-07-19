<script setup lang="ts">
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import FixedSidebar from '@/shared/layouts/FixedSidebar.vue'

import AdministrationNavigation from './widgets/AdministrationNavigation.vue'
import { administrationNavigation } from './config/navigation'
</script>

<template>
  <FixedSidebar>
    <template #sidebar>
      <AdministrationNavigation :items="administrationNavigation" />
    </template>

    <CenteredLayout> ADMINISTRATION </CenteredLayout>
  </FixedSidebar>
</template>

<style scoped lang="scss">
section {
  min-height: 40vh;
  padding: space(6);
  scroll-margin-top: calc($masthead-height + space(15));
}
</style>
