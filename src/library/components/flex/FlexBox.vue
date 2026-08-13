<template>
  <div
    class="flex-box"
    :style="{
      '--flex-gap-x': resolvedGapX,
      '--flex-gap-y': resolvedGapY,
      '--padding': padding,
      display: inline ? 'inline-flex' : 'flex',
      width: fullWidth ? '100%' : 'auto',
      height: fullHeight ? '100%' : undefined,
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
import type { Props } from '@/library/types/components/flex'
import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  inline: false,

  grow: false,
  shrink: true,

  fullWidth: false,
  fullHeight: false,

  gap: 0,
  gapX: undefined,
  gapY: undefined,
  padding: 0,

  direction: 'row',
  wrap: 'nowrap',

  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignSelf: 'auto',
  justifySelf: 'auto',
})

const resolvedGapX = computed<number>(() => props.gapX ?? props.gap)
const resolvedGapY = computed<number>(() => props.gapY ?? props.gap)
</script>

<style scoped lang="scss">
.flex-box {
  padding: calc(var(--padding) * $spacer);
  column-gap: calc(var(--flex-gap-x) * $spacer);
  row-gap: calc(var(--flex-gap-y) * $spacer);
}
</style>
