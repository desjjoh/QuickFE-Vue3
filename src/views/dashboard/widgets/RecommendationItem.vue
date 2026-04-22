<template>
  <FlexBox :gap="6" align-items="center">
    <span class="item__icon">
      <component :is="icon" />
    </span>

    <FlexBox direction="column" :gap="1">
      <BlockText element="h6" weight="semibold">
        {{ title }}
      </BlockText>

      <BlockText tone="secondary">
        {{ description }}
      </BlockText>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

defineProps<{
  icon: Component
  title: string
  description: string
}>()
</script>

<style scoped lang="scss">
.item__icon {
  display: grid;

  padding: space(2);
  border: 1px solid color(border, subtle);
  border-radius: border-radius(md);
  background-color: palette(black, 5);

  :deep(svg) {
    width: space(5);
    height: space(5);
  }
}
</style>
