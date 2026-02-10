<template>
  <div
    class="grid__box"
    :style="{
      '--columns': columns,
      '--gap-x': gapX ?? gap,
      '--gap-y': gapY ?? gap,
      alignItems,
      justifyItems,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
type GridAlignItems = 'start' | 'end' | 'center' | 'stretch'
type GridJustifyItems = 'start' | 'end' | 'center' | 'stretch'

type Props = {
  columns?: number
  alignItems?: GridAlignItems
  justifyItems?: GridJustifyItems
  gap?: number
  gapX?: number
  gapY?: number
}

withDefaults(defineProps<Props>(), {
  columns: 1,
  alignItems: 'stretch',
  justifyItems: 'stretch',
  gap: 8,
})
</script>

<style scoped lang="scss">
.grid__box {
  display: grid;

  grid-auto-flow: row dense;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));

  column-gap: calc(var(--gap-x) * $spacer);
  row-gap: calc(var(--gap-y) * $spacer);
}
</style>
