<script setup lang="ts">
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import FixedSidebar from '@/shared/layouts/FixedSidebar.vue'
</script>

<template>
  <FixedSidebar>
    <template #sidebar> I'm in the sidebar! </template>
    <CenteredLayout> Admin View </CenteredLayout>
  </FixedSidebar>
</template>
