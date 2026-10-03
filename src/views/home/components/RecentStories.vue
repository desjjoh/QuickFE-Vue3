<template>
  <ul class="headline-list">
    <li v-for="(headline, idx) in headlines" :key="idx" class="headline-list__item">
      <AppLink class="headline-list__link" :href="headline.href" tone="inherit" underline="hover">
        {{ headline.title }}
      </AppLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from 'vue-router'

import AppLink from '@/library/components/links/AppLink.vue'

export type Headline = {
  title: string
  href: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
}

defineProps<{
  headlines: Headline[]
}>()
</script>

<style scoped lang="scss">
.headline-list {
  display: flex;
  flex-direction: column;

  margin: 0;
  padding: 0;

  list-style: none;
}

.headline-list__item {
  border-bottom: 1px solid color(border, subtle);
  padding: space(3) 0;

  &:last-child {
    border-bottom: 0;
  }
}

.headline-list__link {
  display: block;

  overflow: hidden;

  color: color(text, primary);

  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
