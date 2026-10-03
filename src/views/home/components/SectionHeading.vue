<template>
  <BlockText element="h3">
    <AppLink :href="href" tone="inherit" underline="hover" class="section-heading-link">
      <span>{{ title }}</span>

      <ChevronRight :size="24" :stroke-width="2.5" />
    </AppLink>
  </BlockText>
</template>

<script setup lang="ts">
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'

import AppLink from '@/library/components/links/AppLink.vue'
import BlockText from '@/library/components/text/BlockText.vue'

defineProps<{
  title: string
  href: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
}>()
</script>

<style scoped lang="scss">
.section-heading-link {
  display: inline-flex;
  align-items: center;

  gap: space(1);
}
</style>
