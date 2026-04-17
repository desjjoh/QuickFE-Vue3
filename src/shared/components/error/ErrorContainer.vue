<template>
  <FlexBox class="error" align-items="center" :gap="3">
    <CircleAlert />
    <BlockText tone="inherit">
      <slot></slot>
    </BlockText>
  </FlexBox>
</template>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<style lang="scss" scoped>
.error {
  padding: space(3);

  background-color: color(theme, danger, dark-alpha, 2);
  color: color(theme, danger, dark-alpha, 11);

  border: 1px dashed color(theme, danger, dark-alpha, 11);
  border-radius: border-radius(md);

  user-select: none;

  :deep(svg) {
    flex: none;

    height: 1.2em;
    width: 1.2em;
  }
}
</style>
