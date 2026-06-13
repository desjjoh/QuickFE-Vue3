<template>
  <FlexBox direction="column" :gap="2">
    <FlexBox :gap="2" align-items="center">
      <slot></slot>
      <slot name="label"></slot>
    </FlexBox>
    <Transition name="form-error">
      <FlexBox v-if="$slots.error" class="alert__text" align-items="center" :gap="1">
        <CircleAlert />
        <BlockText><slot name="error"></slot></BlockText>
      </FlexBox>
    </Transition>
  </FlexBox>
</template>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<style lang="scss" scoped>
.alert__text {
  color: color(theme, danger, theme-alpha, 11);

  &:deep(svg) {
    width: 1em;
    height: 1em;
  }
}
</style>
