<template>
  <CenteredLayout surface>
    <ContentLayout>
      <TopStories />
    </ContentLayout>
  </CenteredLayout>
</template>

<script setup lang="ts">
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import TopStories from './widgets/TopStories.vue'
import ContentLayout from './layouts/ContentLayout.vue'
</script>
