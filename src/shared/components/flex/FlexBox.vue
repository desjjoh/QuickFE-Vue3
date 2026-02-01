<template>
  <div
    class="flex-box"
    :style="{
      '--flex-gap': gap,
      flexDirection: direction,
      justifyContent: justifyContent,
      alignItems: alignItems,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { FlexDirection, FlexJustify, FlexAlign } from './types'

withDefaults(
  defineProps<{
    direction?: FlexDirection
    gap?: number
    justifyContent?: FlexJustify
    alignItems?: FlexAlign
  }>(),
  {
    direction: 'row',
    gap: 0,
    justify: 'flex-start',
    alignContent: 'stretch',
  },
)
</script>

<style scoped lang="scss">
.flex-box {
  display: flex;
  gap: calc(var(--flex-gap) * $spacer);
}
</style>
