<template>
  <CenteredLayout surface>
    <ContentLayout>
      <TopStories />
      <MustWatch />
    </ContentLayout>
  </CenteredLayout>
</template>

<script setup lang="ts">
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import TopStories from './widgets/TopStories.vue'
import ContentLayout from './layouts/HomeLayout.vue'
import MustWatch from './widgets/MustWatch.vue'
</script>
