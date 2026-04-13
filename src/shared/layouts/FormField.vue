<template>
  <FlexBox direction="column" :gap="2">
    <FlexBox v-if="$slots.header" justify-content="space-between" align-items="center" :gap="3">
      <slot name="header"></slot>
    </FlexBox>
    <FlexBox direction="column" :gap="1">
      <slot></slot>
      <FlexBox v-if="$slots.footer" justify-content="space-between" align-items="center">
        <slot name="footer"></slot>
      </FlexBox>
    </FlexBox>
    <FlexBox v-if="$slots.error" class="alert__text" align-items="center" :gap="1">
      <CircleAlert />
      <BlockText><slot name="error"></slot></BlockText>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import { CircleAlert } from 'lucide-vue-next'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<style lang="scss" scoped>
.alert__text {
  color: color(theme, danger, dark-alpha, 11);

  &:deep(svg) {
    width: 1em;
    height: 1em;
  }
}
</style>
