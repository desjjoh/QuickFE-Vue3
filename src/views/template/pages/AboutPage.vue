<template>
  <div class="template__about">
    <FlexBox align-items="center">
      <BlockText element="h1">This is an about page</BlockText>
    </FlexBox>
  </div>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
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
