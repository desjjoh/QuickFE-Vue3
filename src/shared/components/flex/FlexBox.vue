<template>
  <div
    class="flex-box"
    :style="{
      '--flex-gap': gap,
      '--padding': padding,
      display: inline ? 'inline-flex' : 'flex',
      width: fullWidth ? '100%' : 'auto',
      overflowX,
      overflowY,
      flexDirection: direction,
      justifyContent,
      alignItems,
      alignSelf,
      justifySelf,
      flexGrow: grow ? 1 : 0,
      flexShrink: shrink ? 1 : 0,
      flexWrap: wrap,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { Props } from './types'

withDefaults(defineProps<Props>(), {
  inline: false,

  grow: false,
  shrink: true,

  fullWidth: false,

  gap: 0,
  padding: 0,

  direction: 'row',
  wrap: 'nowrap',

  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignSelf: 'auto',
  justifySelf: 'auto',
})
</script>

<style scoped lang="scss">
.flex-box {
  padding: calc(var(--padding) * $spacer);
  gap: calc(var(--flex-gap) * $spacer);
}
</style>
