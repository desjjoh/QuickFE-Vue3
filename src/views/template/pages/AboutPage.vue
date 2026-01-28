<template>
  <div class="template__about">
    <BlockText element="h1">This is an about page</BlockText>
  </div>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<style scoped lang="scss">
@media (min-width: 1024px) {
  .template__about {
    display: flex;
    align-items: center;
  }
}
</style>
